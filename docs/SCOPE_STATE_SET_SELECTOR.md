# SCOPE — stop selecting a state set by executing a regex against user-facing copy

| | |
|---|---|
| Status | **OPEN — written 2026-09-07, not built. PREMISE RE-MEASURED AND AMENDED 2026-09-14; see §7, which is authoritative over §§1, 2, 4 and 6.** Discharges the second half of **D-NM-1 (c)** |
| Premise verified against | **v5.71 source `9e79b92f9eb91e86489cb6b80caa33c3`, repo `c3d1cd4`** (re-measured 2026-09-14). *(Superseded: v5.66 source `31b43e094307ef5f996570c090478e13`, repo `7fc8b58`.)* |
| Owed by | `STOP-REPORT-v5_66-nm-session2.md` §4 and `STOP-REPORT-v5_66-NM-note-guarded-set.md` §3 |
| Direction | No user-visible figure moves. This is a **test-infrastructure** change |

> ⚠⚠ **PREMISE RE-MEASURED AT v5.71 (2026-09-14). FOUR THINGS IN THIS DOCUMENT ARE NOW WRONG, AND §7 CORRECTS THEM.**
> The **defect class stands and is confirmed** — but the census is **10 sites, not 7 or 9**; **six of those sites are
> deliberate phrase pins that must KEEP executing the regex**, so the conversion target is **three**, not nine; §4's test 2
> targets a set that is **empty**; and §6's D-S2 calls this a `qa/`-only release with no version bump, which **cannot hold
> for option (b)** — priced at **86 judgement points** by `vercensus.cjs`. **A third live instance of the defect was found
> in this scope's own census: `f6_probe.cjs` has reported the COMPLEMENT of the live gate for three releases.**
> **Read §7 before building. Do not build from §§1–6 alone.**

> ⚠ **PREMISE ANNOTATED AT v5.69 (2026-09-10).** Rhode Island converted, so the second set §2 describes — *income-limited
> but still modelled unconditionally* — is now **EMPTY** and is asserted empty (`t29` F-6 inverted, `t35` D-8 inverted, each
> state pinned as converted-not-reworded by D-7a…D-7d). The first set — *income-limited in law* — is unchanged, and it is
> still selected by executing a regex against note prose, now at **nine** sites (`sel_census.cjs`, v5.68) less the census row
> that retired at v5.69. This scope therefore stays OPEN and its defect class stands: a reworded note can still leave the
> in-law set silently. Its §4 test 2 (derive the unconverted set) is now the trivial empty set. SCOPE_RI_POPULATE D-RI-4.

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

---

## 7 · AMENDMENT — premise re-measured at v5.71, 2026-09-14. Authoritative over §§1, 2, 4 and 6.

**Every figure below is command output from 2026-09-14 against v5.71 source
`9e79b92f9eb91e86489cb6b80caa33c3` at repo `c3d1cd4`.** The §A freshness check passed first: manifest,
`md5sum` and `CHANGELOG.md` agree, and the pool (120 files) carries no drift.

**The defect class stands.** Nothing here weakens the case for building. Three of the four corrections
make the case *stronger*; the fourth changes the release shape.

### 7.1 · The census is TEN sites, and §1's seven is two premise-moves out of date

`sel_census.cjs qa qa/tools qa/qa-baseline`:

```
sites executing an income-limit matcher: 10
  qa/t10_taxcases.mjs:970        /income[- ]limited|income limit/i
  qa/t10_taxcases.mjs:972        /income[- ]limited|income limit/i
  qa/t29_boundaries.mjs:241      /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:288  /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:301  /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:309  /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:313  /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:329  /income[- ]limited|income limit/i
  qa/t35_state_populate.mjs:506  /several income-limited exclusions (are treated )?as unconditional/i
  qa/tools/f6_probe.cjs:34       /income[- ]limited|income limit/i
```

`boundaries.mjs:117` has **legitimately left** the census — its `state_excl_limited` row retired at
v5.69 (D-3c / SCOPE_RI_POPULATE D-RI-4). `t35` grew from two sites to five. `f6_probe.cjs` is new
since §1 was written.

### 7.2 · ⚠ THE CORRECTION THAT RESHAPES THE BUILD — six of the ten are PINS, not selectors

**§3's "convert every site" is wrong for six of them, and converting them would destroy what they
assert.** Read at source, the ten divide by role:

| Site | Role | Action |
|---|---|---|
| `t29:241` | **SELECTOR** — builds `limited` from prose, with `!r.exclTest` | **convert** |
| `t35:288` | **SELECTOR** — builds `offenders` from prose, with `exclTest === undefined` | **convert** |
| `f6_probe.cjs:34` | **SELECTOR** — and it is STALE; see §7.3 | **convert + fix** |
| `t10:970` | **PIN** — *WI's note must NOT match* (D-F, v5.59) | keep executing; read the shared matcher |
| `t10:972` | **PIN** — *RI's note must still match* | keep executing; read the shared matcher |
| `t35:301` | **PIN** — D-7a, *NM left by CONVERTING, not rewording* | keep executing; read the shared matcher |
| `t35:309` | **PIN** — D-7b, NJ, the same | keep executing; read the shared matcher |
| `t35:313` | **PIN** — D-7c, VA, the same | keep executing; read the shared matcher |
| `t35:329` | **PIN** — D-7d, RI, the same | keep executing; read the shared matcher |
| `t35:506` | **COPY LOCK** — a different pattern, against `DOCS_HTML` | **OUT OF SCOPE**, with `_AGE_NOTE` |

**For the six pins, executing the regex against prose IS the assertion.** D-7a…D-7d exist precisely to
catch a state leaving the guarded set by *rewording* rather than converting — the v5.54 New Jersey
defect. A pin that stopped executing the pattern would stop pinning the phrase. §3 already says keep
them through this release; §7 makes that a rule rather than an aside, because "convert every site" is
the reading a session will otherwise take from §1's census.

**So the build is: three selectors converted, six pins centralised onto one shared matcher constant,
one stale selector repaired.** That is option (b) for membership plus option (c) for the pattern, and
it is smaller and better-shaped than "nine sites."

⚠ **A fourth micro-divergence, recorded while classifying.** The two live selectors do not use the same
predicate: `t29:241` writes `!r.exclTest`, `t35:288` writes `R[c].exclTest === undefined`. They agree
today because all five rows carry a function, but `exclTest: null` or `false` would split them. The
shared helper must fix the predicate too, not only the membership.

### 7.3 · ⚠ THE THIRD LIVE INSTANCE — `f6_probe.cjs` reports the COMPLEMENT of the gate

`f6_probe.cjs:35` still carries the **pre-v5.68** selector. `t29:241` gained `!r.exclTest` at v5.68
(D-VA-3). The probe never did. Applied to v5.71 source:

```
STATE_RULES entries: 51
f6_probe  (no !exclTest): NM, RI, VA
t29 F-6 (with !exclTest): (EMPTY)
```

**All three states the probe names carry `exclTest`** — they are exactly the rows the gate deliberately
excludes. The probe has been reporting the complement of the thing it probes for three releases.

This is the scope's own thesis — *a correction to one copy leaves the others wrong* — happening **to the
instrument built to catch it**, and sitting inside this scope's own site census. It is the strongest
evidence in the document and it was not in the document. **Fix it in the same release; a probe that
inverts its gate is worse than no probe.**

### 7.4 · §2's sets and §4's test 2 are stale — the derived set is EMPTY

Measured per row at v5.71:

```
  CT excl65=0       exclTest=yes  note~regex=no
  NJ excl65=0       exclTest=yes  note~regex=YES
  NM excl65=8000    exclTest=yes  note~regex=YES
  RI excl65=50000   exclTest=yes  note~regex=YES
  VA excl65=12000   exclTest=yes  note~regex=YES
```

**All five carry `exclTest`**, so §4 test 2's set — *in law AND still modelled unconditionally* — is
**empty**, not `NJ, RI, VA`. Test 2 must be rewritten to assert emptiness, gated per leg, matching the
inversions `t29` F-6 and `t35` D-8 already took at v5.69.

⚠ **A correction this amendment owes.** A first reading of the table concluded that prose was
*under-reporting* the in-law set by two states. **That is wrong.** NJ and CT fall out of the
prose-selected set because `excl65 = 0`, not because of their notes — NJ's note still matches the
regex; CT's does not. The mechanism matters, and the wrong version was nearly written into this
document.

**What the table does establish is the strongest argument for the field, and §2 does not make it: the
five-member in-law set is currently UNREPRESENTABLE.** No selector can produce it — two members have
`excl65 = 0` and one fails the regex. The set exists as a statutory fact and as prose in a document,
and **nowhere in the data**.

### 7.5 · ⚠ §6's D-S2 CANNOT HOLD FOR OPTION (b) — the third scope to under-price a version bump

D-S2 answers *"standalone `qa/`-only release, no version bump, no figure movement."* Option (b) puts
`incomeLimitedInLaw` on five `STATE_RULES` rows, which is `src/DangerClose.jsx`. **Any source change
after a hash has been quoted means a version bump** — plus four in-app sites, a rebuild, `smoke_built`,
and a new `dom_entry_v572.jsx`. `vercensus.cjs v571`:

```
FILES to register the new tag in : 20
ladder entries (mechanical)      : 21
GATED expressions (a judgement)  : 65
total judgement points           : 86
```

`vercensus.cjs`'s own header records **two** prior scopes that priced a bump as "four in-app sites" and
were wrong by roughly a factor of sixty — v5.54's scope, and `SCOPE_VA_NOTE_CORRECTION.md` §3C, the
second written while the stop report naming the first sat in the same repo. **§6 D-S2 is the third
instance.** Recorded here so the count is visible: this is a recurring failure of the same shape, not
three accidents.

### 7.6 · The decision taken, 2026-09-14 — STAGED

**Option (b) staged through a suite-side single source of truth.** Agreed with the maintainer:

1. **NOW, `qa/`-only, no version bump.** One shared module — the natural name is
   `qa/tools/state_sets.cjs`, CommonJS so both the `.mjs` suites and `f6_probe.cjs` can read it —
   exporting the five-member in-law list, the single `NOTE_MATCHER` regex, and one `unconverted(RULES)`
   helper carrying the corrected `!exclTest` predicate. Three selectors convert to it; six pins read
   `NOTE_MATCHER` instead of a verbatim copy; `f6_probe` is repaired. Sites resolve it with the
   established `pick(join(HERE,"tools",X), join(HERE,X))` fallback, as `t29` does for `boundaries.mjs`.
2. **LATER, folded into the next release that is already bumping the version for another reason** —
   the `incomeLimitedInLaw` field on the five `STATE_RULES` rows, paying the 86 judgement points once
   rather than twice.

**The residual risk of stage 1, stated plainly:** the in-law list is hand-maintained in the suite rather
than derived from app data, so a future populate release editing `STATE_RULES` would not update it.
**Stage 1 therefore ships a DRIFT GUARD, not a promise** — an assertion that no state outside the list
matches `NOTE_MATCHER` with `excl65 > 0`, so a row that the old prose selector would have caught and the
list does not fires loudly.

### 7.7 · Tests §4 should ship with, as amended

1. The five-member in-law set is asserted **from the shared list**, and `t35`'s `offenders` and `t29`'s
   `limited` are both derived from it — not from prose.
2. ~~the unconverted set equals NJ, RI, VA~~ → **the unconverted set is EMPTY**, gated per leg.
3. **The drift guard of §7.6.**
4. **`f6_probe` agrees with `t29` F-6 on the same source** — the regression test for §7.3, and the one
   that would have caught it three releases ago.
5. **A negative control per converted site** (§B2): breaking the shared list must turn each site red.
   ⚠ A shared module makes it *easier* to write a control that fires once and looks like six; each site
   needs its own.
6. **The six pins keep firing on a reworded note.** Centralising the matcher must not weaken D-7a…D-7d.

### 7.8 · Budget — stated because this scope has now been under-priced twice

Stage 1 is a full session: one module, three conversions, six centralisations, one repair, six test
groups with a control each, a ~13-minute both-leg suite run, four documents, packaging, and post-ship
verification. **It is not a half-session job, and the honest failure mode is a half-converted suite.**
