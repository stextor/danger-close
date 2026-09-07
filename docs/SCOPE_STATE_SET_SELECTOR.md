# SCOPE — stop selecting a state set by executing a regex against user-facing copy

| | |
|---|---|
| Status | **OPEN — written 2026-09-07, not built.** Discharges the second half of **D-NM-1 (c)** |
| Premise verified against | v5.66 source `31b43e094307ef5f996570c090478e13`, suite at repo `7fc8b58` |
| Owed by | `STOP-REPORT-v5_66-nm-session2.md` §4 and `STOP-REPORT-v5_66-NM-note-guarded-set.md` §3 |
| Direction | No user-visible figure moves. This is a **test-infrastructure** change |

## 1 · The premise, verified

**D-NM-1 was answered (c): ship New Mexico on a safe note AND scope the selector fix in the same
session, not as an intention.** The note half shipped at v5.66 — NM's note retains the phrase
*"income-limited"*, a comment at the site says the phrase is load-bearing, and `t35` **D-7a** pins
it as an extinction invariant. **This document is the other half.** Until it existed, (c) had
quietly become (a), which the first stop report explicitly calls not an acceptable final answer.

**The defect class.** Several checks select the set of states whose exclusion is income-limited in
law by **executing a regular expression against `STATE_RULES[c].note`** — a string written for
users, displayed in the app. Set membership is therefore a property of prose. Improving the prose
can silently shrink the set, and **a shrinking set is invisible to a passing suite**: every
assertion still runs, against fewer states, and reports green.

**This has now happened twice, which is why it is a class and not an incident.**

- **New Jersey, v5.54.** The note was improved and NJ dropped out of the guarded set.
- **New Mexico, v5.66.** Populating NM required rewriting its note. The rewrite was deliberately
  constrained to keep the phrase, and a negative control confirmed that removing it fires `t35`
  D-7a. That control firing is the good outcome; **needing it at all is the defect.**

### The site census — from the parser, not a grep

Run at the v5.66 build with an AST census over `qa/` and `qa/tools/`
(`qa/tools/sel_census.cjs`, added by this session; a grep cannot tell a regex literal from a
mention of one inside a comment, and cannot execute it):

```
sites executing an income-limit matcher: 7 distinct
  qa/tools/boundaries.mjs:117      /income[- ]limited|income limit/i
  qa/tools/f6_probe.cjs:34         /income[- ]limited|income limit/i
  qa/t10_taxcases.mjs:921          /income[- ]limited|income limit/i
  qa/t10_taxcases.mjs:923          /income[- ]limited|income limit/i
  qa/t29_boundaries.mjs:233        /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:284    /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:296    /income[- ]limited|income limit/i
```

**Seven sites, one pattern, copied verbatim seven times.** No site derives the pattern from any
other, so a correction to one leaves six wrong — which is its own instance of the two-copies
problem the project instructions describe.

**Independently confirmed that the v5.66 note is currently safe**, using
`qa/tools/suite_regex_probe.cjs`, which extracts every regex literal in the suite by AST and
**executes** it against the old and new note text. Of 557 regex literals, the only verdict change
between NM's v5.65 and v5.66 notes was in an unrelated tokeniser in `diverge.cjs`. The
income-limit matchers return the same verdict on both. **The current state is safe; the mechanism
is not.**

## 2 · What the set actually means

Two different sets are being selected by the same string, which is part of why prose became the
carrier:

- **"income-limited in law"** — a statutory fact about the state. NM, NJ, RI, VA, CT. Fixed;
  changes only when a legislature acts.
- **"income-limited but still modelled unconditionally"** — the *unconverted* remainder, which
  shrinks by one every populate release. At v5.66 it is **NJ, RI, VA**.

`t35` D-7 asserts the second. `t29` F-6 and `boundaries.mjs` guard the first. Conflating them in
one regex is why populating a state and rewording its note look identical to the matcher.

## 3 · Options

**(a) Do nothing; keep pinning each note with an extinction invariant.**
Cheapest. It is what v5.66 shipped. It does not scale: every future populate release must remember
to add a D-7a-shaped pin, and the pin protects the *phrase*, not the *fact*. Rejected as a final
answer by the first stop report.

**(b) Add a structural field to `STATE_RULES` and select on that.**
Each of the five gains an explicit marker — e.g. `incomeLimitedInLaw: true` — and all seven sites
read the field instead of the note. Set membership becomes a data property, unaffected by copy.
The unconverted set becomes derivable rather than asserted: `incomeLimitedInLaw && !exclTest`.

**(c) Keep the regex but centralise it in one exported helper.**
Reduces seven copies to one. Does not fix the class: membership still depends on prose.

### Recommendation — **(b)**, with (c)'s centralisation folded in

(b) is the only option that removes the dependency on user-facing copy, which is the defect. It is
small: one boolean on five rows, and seven call sites changed to read it. It also makes the
*second* set computable instead of hand-listed, so a future populate release updates one place
(the state's `exclTest`) rather than two.

Fold in (c) because it costs nothing extra once the sites are being edited anyway: the derivation
lives in **one** exported helper, and the seven sites call it.

⚠ **The note phrase must NOT be deleted in the same release.** Once membership is structural, the
phrase stops being load-bearing — but proving that is the job of the negative control, not of an
assumption. Keep the phrase and `t35` D-7a through the release that lands this, verify the control
still fires on the *field*, and retire the phrase pin in a later, separate change. Two mechanisms
overlapping for one release is cheap; a gap between them is exactly this defect again.

## 4 · Tests this ships with

1. **The five-member set is asserted from the field**, per leg, gated (§B2) — `t34` §A is the home.
2. **The unconverted set is DERIVED, not listed**: `incomeLimitedInLaw && !exclTest` must equal
   NJ, RI, VA at v5.66+. This replaces `t35` D-7's hand-written list.
3. **Extinction — the class itself.** Reword every one of the five notes out of the old regex's
   reach and assert the set is UNCHANGED. This is the assertion that would have failed before the
   change and must pass after; it is the whole point and must not be omitted.
4. **A negative control per site**, since the failure mode is silence: flip the field on one state
   and confirm each of the seven sites notices. **A control that does not fire is the finding.**
5. `t35` D-7a is **retained unchanged** for this release, per §3's warning.

## 5 · Explicitly out of scope

- Populating RI, VA or NJ. Those are `SCOPE_INCOME_CONDITIONING.md`, one per release.
- Any change to what the notes SAY to users. This is about what the tests READ.
- The other copy-matching selectors in the suite (the `_AGE_NOTE` phrase matcher at `t10` L658 is
  the same class and is documented in `TESTING.md`). **Named here so it is not mistaken for having
  been fixed** — it has not, and it should get its own pass rather than riding this one.

## 6 · Open decisions

Both are pre-answered with the session's recommendation, per Steve's standing instruction to use
them; either can be overridden before build.

- **D-S1 — field name.** Recommend **`incomeLimitedInLaw`**: it says *in law*, which is the
  distinction §2 shows was being lost. (Alternative considered: `incomeTested`, shorter but
  ambiguous between the two sets.)
- **D-S2 — release shape.** Recommend a **standalone `qa/`-only release**, no version bump, no
  figure movement. It touches seven test sites and five data rows and changes no output; bundling
  it with a populate release would make a green suite ambiguous about which change kept it green.
