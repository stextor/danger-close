# SCOPE — D-22, option 3, batch 1 · ten states on their own bracket schedules (v6.00)

**FULFILLED — shipped as v6.00 (2026-10-09).** Repo-only. §7 is the build record. D-22 itself stays open for seventeen rows.

*(Superseded status line, retained:)* **READY — 2026-10-09.** Repo-only. Steve, 2026-10-09: "V5.99 is in, please verify. Then on the next build I pick option 3" — option 3 of
the three offered after v5.99: model the progressive states' real bracket schedules, read from the law, in batches (the alternatives were
the top rate everywhere, or a derived effective rate). Under his standing instruction every decision below carries a recommendation the
build takes and records. **Stop only where §5's conditions fire.** A MODELLING release: METHODOLOGY changes.

## 0 · Premise (verified against v5.99, not assumed)

Freshness (OPERATIONS §A): repo `5c90d85` (source commit `f7ce172`), full clone; source `8c02876e4841e638a1a83425314586f4` = repo = pool
(verified 2026-10-09 at the v5.99 check) = CHANGELOG newest; v5.99 rebuilt byte-identical first: built `8047df4c66caab74d43ec42541f65d3d`.
Pool 127.

**The model, read by AST.** `stateTaxAnnual` ends `r.rate * (retBase + work + ssBase + capGains) − _ssCredit`: one rate on the whole base,
for every state. For the progressive states the rate is either a top rate (Oklahoma, from v5.97) or an "effective" rate of the model's own
making (California 6 %, New York 6 %, New Jersey 5.5 %, Oregon 8 %, Minnesota 6.8 %, Wisconsin 5.3 %, South Carolina 6 %). Readers of
`rate` (AST census, §2): the calculator (twice — the zero-tax test and Utah's credit), the wizard (stores it as the plan's fallback rate),
My Data (the state picker stores it; the model line prints it; the "(no tax)" label), and the AI context line (prints the stored rate). With a
state code set, the stored fallback rate is never read by an engine.

**The law, read at primary sources on 2026-10-09** (each schedule re-read by me after a research pass; quotations in the session record):

| State | Schedule | Source |
|---|---|---|
| CA | Schedules X / Y, nine brackets 1 %–12.3 % (**TY2025**: TY2026 not yet published; the 2026 540-ES says to use the 2025 table), + Behavioral Health Services Tax 1 % of taxable income over $1,000,000 at every filing status | FTB Tax News Oct 2025 ("2025 Indexing"); 2026 Form 540-ES instructions; R&TC §17041, §17043 |
| MN | 5.35 / 6.8 / 7.85 / 9.85 %; single to $33,310 / $109,430 / $203,150; joint $48,700 / $193,480 / $337,930 | MN DOR, TY2026 brackets (Dec 2025) |
| MS | 0 % on the first $10,000, 4 % above (2026) | Miss. Code §27-7-5 (HB 1, 2025); MS DOR rate table |
| NJ | Table A (single) seven rows 1.4 %–10.75 %; Table B (joint) eight rows, incl. a 2.45 % band | N.J.S.A. 54A:2-1 (P.L.2020 c.94); Division of Taxation schedules ("2020 and after"; not indexed) |
| NY | nine rows 3.9 %–10.9 %; tax-benefit recapture above NYAGI $107,650 | Form IT-2105-I (2026) rate schedules and worksheets; Tax Law §601 |
| OK | 0 / 2.5 / 3.5 / 4.5 %; single to $3,750 / $4,900 / $7,200, joint double | HB 2764 (2025), 68 O.S. §2355; OTC Packet OW-2 (2026) |
| OR | 4.75 / 6.75 / 8.75 / 9.9 %; single to $4,550 / $11,400 / $125,000, joint $9,100 / $22,800 / $250,000 | Publication OR-ESTIMATE (2026); ORS 316.037 |
| SC | 1.99 % to $30,000; 5.21 % × income − $966 above — every filing status | Act 110 of 2026 (H.4216, ratified text), S.C. Code §12-6-510(C); SCDOR IL 26-20 |
| VA | 2 / 3 / 5 / 5.75 %; to $3,000 / $5,000 / $17,000 — the same schedule for every filing status | Va. Code §58.1-320 (unchanged since 1990) |
| WI | 3.5 / 4.4 / 5.3 / 7.65 %; single to $15,110 / $51,950 / $332,720, joint $20,150 / $69,260 / $443,630 | 2026 Form 1-ES instructions; Wis. Stat. §71.06 |

Findings from the reading that bear on the design:
- **New York's recapture** (IT-2105-I 2026): above NYAGI $107,650, worksheet 1 (taxable income ≤ $215,400 single / ≤ $161,550 joint) moves
  the tax toward a FLAT 5.9 % single / 5.4 % joint on ALL taxable income, by (NYAGI − $107,650) / $50,000 rounded to four places, complete
  at $157,650. The later worksheets add a recapture base plus an incremental benefit phased in over $50,000; fully phased in, each equals the
  bracket's own rate on all taxable income (checked on the printed figures: MFJ worksheet 2's $333 + $807 = 5.9 % × $161,550 − $8,391 =
  $1,140.45; single worksheet 2's $567 + $2,047 = 6.85 % × $215,400 − $12,141 = $2,613.90). Above NYAGI $25,000,000: 10.9 % of all of it.
- **South Carolina's Act 110** replaces the federal standard and itemized deductions with the SC Income Adjusted Deduction ($15,000 single,
  $30,000 joint, phased out by AGI) and **does not amend §12-6-1170** — the $15,000 age-65 deduction and the retirement deduction stand, so
  the row's `excl65` stays.
- **New Jersey's** joint $70,000–$80,000 row ("× .035, subtract $1,154.50"; statute "$1,295.50 plus 3.5 % of the excess") is 50 cents above
  its own lower rows' sum ($1,295.00). Every other row in both tables is the exact bracket sum.
- **Printed bases are rounded** in New York (whole dollars, up to $0.90 from the bracket sum), Oregon (up to $0.50) and California (cents,
  up to $0.013). The model computes the bracket sum.
- **Mississippi's** zero band is per return on a joint return and per spouse on a combined return (both spouses with income).
- **Virginia** taxes a married couple on the single schedule; Filing Status 4 or the spouse tax adjustment (up to $259) softens it.
- **No state standard deduction or personal exemption** is modelled anywhere today; the rows' exclusions are retirement-income or age
  exclusions only.

**Measured** (scratch probe `/home/claude/m600/m600.mjs`, v5.99 against the staged v6.00; not shipped):
- **Engine B** (Taxes tab, example household, lifetime state tax, Roth $0 → $70,000/yr): only the ten rows move, and only state-tax fields.
  CA $109,108 → $72,258 ($113,100 → $58,773) · MN $151,642 → $140,098 · MS $2,565 → $991 · NJ $26,360 → $13,388 · NY $65,747 → $54,969 ·
  OK $64,281 → $55,476 · **OR $145,477 → $146,037 (rises)** · SC $74,510 → $46,676 · VA $86,431 → $80,326 · WI $56,266 → $45,957. The other 42
  jurisdictions are byte-identical.
- **Engine A** (Roth comparator, three households): strategy tax moves both ways (example household 9 up / 51 down; H1 21 / 39; H2 11 / 49).
  Tax rises where the single schedule now binds at higher incomes than the old effective rate assumed (CA, OR, MN and NY for the early
  widow H1). **The estate-best strategy changes in five cells**: H1 MN fill12 → fill22, NJ irmaa1 → fill22; H2 CA fill22 → irmaa1, SC irmaa1 →
  fill22, WI fill22 → irmaa1. Expected: with a graduated schedule a conversion's state cost depends on the bracket it fills, which a flat rate
  could not see. Reported, not a stop condition (§5).
- Engines C and D compute no state tax.

**Direction:** mixed, by design — the release replaces numbers of the model's own making with the law. Low and middle incomes mostly fall
(the effective rates overstated the lower brackets); high incomes in CA, OR and NY's single schedule rise.

## 1 · Decisions (taken on recommendation; §7 records each)

- **BR-1 — the field.** A row may carry `brackets: { single: [[upTo, rate], …], joint: [...] }`, ascending, `upTo` inclusive ("not over"),
  the last row `[null, top]`. The calculator taxes such a row on its schedule — single or joint by the return's status, so a survivor files on
  the single schedule — applied to the SAME base the flat rate saw. Every other row keeps `rate × base`. *Alternative:* replace `rate` with the
  schedule — rejected, see BR-2.
- **BR-2 — `rate` stays a scalar equal to the schedule's top rate**, asserted by `t64` A-5 for every row that carries a schedule. Its readers
  keep working: the zero-tax test, Utah's credit (Utah is flat), the wizard and My Data (which store it as the manual fallback, unused while a
  state is chosen), and t61's rate-claim guard. California's top rate is 13.3 % (12.3 % + the BHST).
- **BR-3 — no state standard deduction, personal exemption or exemption credit.** Not modelled before this release and not added by it: one
  change at a time, and leaving them out overstates tax (conservative). Disclosed in each note and in the Field Manual. *Recommended next:* a
  follow-up release that adds them, state by state, from the same sources.
- **BR-4 — later years.** Each schedule is held at its latest published year for every model year, as every figure in the module is. Real
  schedules are indexed upward in most of these states, so holding them overstates tax over time (conservative). California's is the TY2025
  schedule (TY2026 unpublished): conservative, dated "brackets 2025" in My Data.
- **BR-5 — New York's recapture is modelled.** Worksheet 1 exactly (flat 5.9 % / 5.4 %, the four-place fraction); above its taxable-income
  limit, the end point of the later worksheets at once — the bracket's own rate on all taxable income — where the law phases it in over
  $50,000 (conservative, disclosed). The measure is the row's own state base, which is New York AGI net of the pension exclusion and of
  Social Security, as the law's is; it carries no dividend or interest income (the module-wide limitation). *Alternative:* ignore the
  recapture — rejected: it would understate New York tax by up to the full benefit of the lower brackets above $157,650, the optimistic
  direction. *Alternative:* model every worksheet's phase-in — rejected for now: it needs the printed recapture-base and incremental-benefit
  table for each tier, which the extraction garbled; a later release can add it.
- **BR-6 — Mississippi: one zero band per return** (single and joint alike). A combined return on which both spouses have income takes one
  per spouse in law; not modelled (conservative, at most $400 a year). Disclosed in the note.
- **BR-7 — Virginia: one schedule for every status**, as the statute has it. Filing Status 4 and the $259 spouse tax adjustment are not
  modelled (conservative). Disclosed.
- **BR-8 — South Carolina:** Act 110's two rates for every status; the `excl65` $15,000 age-65 deduction stays (§12-6-1170 unamended); the new
  SC Income Adjusted Deduction is not taken (conservative, BR-3). Disclosed.
- **BR-9 — New Jersey's 50 cents** in the joint $70,000–$80,000 band is not modelled (the model is 50 cents below the statute there — the one
  optimistic residue, immaterial and disclosed in the note).
- **BR-10 — dated figures.** `years.brackets` on each row: 2026, California 2025; New Jersey and Virginia 2026 (their unindexed schedules,
  read as in force for TY2026). `STATE_FIGURE_LABELS` gains `brackets: "brackets"`, so My Data's dated line shows it. D18-1 holds: a
  schedule's thresholds are dollar figures; a rate never carries a year.
- **BR-11 — the display.** My Data's model line, for a row with a schedule: "the state's own brackets, L% to T%" in place of "T% effective
  rate (an approximation)"; unchanged for every other row. The AI context's state line: "income tax on the state's own brackets, top rate T%"
  for such a row. The wizard and the picker still store `rate` as the fallback (BR-2).
- **BR-12 — the Field Manual.** Three sentences change (DOCS_HTML; quote-free anchors): the Taxes entry's "each state's effective rate" and
  "effective rates stand in for progressive brackets", and the methodology entry's "uses effective flat rates in place of progressive state
  brackets". Each new clause is held to its code fact by `t64` E (OPERATIONS §B2).
- **BR-13 — the batch is these ten.** The other progressive rows keep one rate and D-22 stays open for them: AL, AR, CT, DE, DC, HI, KS, ME,
  MD, MO, MT, NE, NM, ND, RI, VT, WV (seventeen, each to be read the same way). Ohio and Idaho keep their flat convention with disclosed zero
  bands (v5.99).
- **BR-14 — the version is v6.00.** v5.99 is the last two-digit minor in the v5 line. The tooling assumed a major of 5 in thirteen places
  (mk_runfolder's tag-to-version map, smoke_built's four version-site patterns, t9's version badge, domdiff_withdrawal's version strip,
  vergates, vercensus and vercensus_list's tag patterns, package_check's pool-file patterns, and package_check_controls' manifest arithmetic);
  each is widened to any single-digit major, and the controls' decrement is made arithmetic (600 − 1 → v5.99). *Alternative:* v5.100 —
  rejected: the suites compare tags as strings ("v5100" sorts below "v599") and sort pool files lexically.
- **BR-15 — the parity guardrail.** `t2`'s `stateTax` fingerprint is a Georgia call; Georgia is not in the batch, so no key may move and no
  declaration is added. A move fails the build (§5).
- **BR-16 — derived pins.** Hand cases elsewhere that price a batch state at its old single rate are gated per build with version lists,
  never re-pinned for every leg: their BASE is kept (the exclusion arithmetic each exists to pin) and the bracket leg's expectation is that
  base on the state's schedule, computed in the suite independently of the app, with the label saying so.

## 2 · Site census (AST)

**Source** (`stage_v600.py`, 32 anchors, each counted once on v5.99): the ten rows (schedule, top rate, `years.brackets`, NY's
`recapture`) and their notes (ten); `STATE_FIGURE_LABELS`; two helpers (`stateBracketTax`, `stateBracketRate`); the calculator's final
line; My Data's model line; the AI context line; three Field Manual sentences; four version sites. No other source site reads a state's
`rate` (the remaining `.rate` reads are the federal brackets'). The wizard's `stateTaxRate: rules.rate` and the picker's `setStateTax` are
unchanged by decision (BR-2).

**Suite:** literal and derived pins are found by running the full suite on the staged build (the census of hand figures that are products of
a rate is the run) and gated per BR-16. The version-pattern census (BR-14) is by search over the tooling and confirmed by running it.

## 3 · Tests

New suite **`t64_state_brackets.mjs`**, both legs (the v5.99 leg pins the single rates and the absence of schedules):
- **A** — the ten schedules equal §0's sources, each dated; New York's recapture fields; EXTINCTION over every row that carries a schedule:
  ascending, rates never fall, last row open, top rate = `rate`; every note states its top rate for its year and names its simplification.
- **B** — each schedule against the state's PRINTED table: CA within 2 cents, WI, OK, NJ and SC to the cent, NY and OR within $1; New
  Jersey's 50-cent row asserted as the statute less 50 cents, and the next row back on the statute's own arithmetic.
- **C** — hand cases to the cent through `stateTaxAnnual`, each computed independently with Decimal arithmetic from the printed tables
  (session working, `/tmp/claude-0/sp/hand.py`): CA (incl. the BHST line), MN, MS, NJ, OK, OR, SC, VA (one schedule for a couple), WI; New
  York's recapture at $100,000, at exactly $107,650, inside the phase-in, at $157,650, above the worksheet-1 limit, joint, and net of the
  pension exclusion; a survivor on the single schedule; Georgia unchanged.
- **D** — (v6.00 leg, needs `app_v599.mjs`) every jurisdiction × a grid of 160 households: byte-identical outside the ten; inside, equal to
  an independent schedule applied to v5.99's base.
- **E** — My Data's line for NY, CA, OK (and Maine unchanged), the AI context line, the three Field Manual sentences, each with its code fact.
- Controls `qa/tools/controls_v600_brackets.py` (repo-only), §3.1.

### 3.1 · Controls (each mutation must turn the named check red)

K1 a threshold moved (NY single $80,650 → $80,600) · K2 `rate` ≠ the top bracket (CA) · K3 NY's recapture removed · K4 the calculator's
bracket branch reverted to `rate × base` · K5 joint returns read the single schedule · K6 the recapture fraction applied without the
worksheet-1 cap (full flat at once) · K7 a state outside the ten moves (GA's rate) · K8 a Field Manual sentence reverted · K9 the My Data line
reverted · K10 `t2`'s Georgia fingerprint disturbed (parity must fire).

## 4 · Out of scope

State standard deductions, exemptions and credits (BR-3); the other seventeen progressive rows (BR-13); New York's later-worksheet phase-ins
(BR-5); NYC and other local taxes; Mississippi's combined return; Virginia's Filing Status 4; South Carolina's SCIAD; indexing the schedules
forward (BR-4); any change to the exclusions themselves.

## 5 · Stop conditions

Stop and report if: a primary source contradicts §0; anything outside the ten rows moves (`t64` D, MC parity); a schedule fails its printed
table beyond the stated tolerance; a suite asserts the old single rate on purpose in a way BR-16 cannot gate honestly.

## 7 · Build record (v6.00, 2026-10-09)

- **Source** `d535e13e865e9592e41f93f4359328f0` (32 anchors, each once on v5.99: ten rows, ten notes, the figure label, the two helpers, the calculator's last line, My Data's line, the
  AI context line, three Field Manual sentences, four version sites). **Built** `3e02a42fac6f6281d7c0b17ab77cdcbd` (v5.99 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — outside the ten the calculator is byte-identical (`t64` D-1) and MC parity is 10/10 with no declaration; every
  schedule reproduces its printed table within the stated tolerance (`t64` B); no source contradicted §0.
- **`t64`** 65 (v6.00) / 34 (v5.99). **Controls 11 of 11.**
- **Corrections found by the run, owned here:**
  - `t64`'s first draft priced California at $800,000 from the PRINTED base ($72,219.84) and failed by 1.3 cents: California prints each base rounded
    from its unrounded sum ($72,219.827). The hand figure is the bracket sum; B-CA's tolerance is 2 cents, stated in its label.
  - `t64` A-6 first compared a note's stated rate to `rate` with `!==` and failed Minnesota on float noise (9.85 / 100); it uses t61's 1e-9 tolerance.
  - Control K1 first expected `B-NY` to fire: it cannot — moving a threshold $50 at a 0.5-point step shifts the base by $0.25, inside the $1 New York's
    rounded bases need. `A-2NY`, `C-NY` and `D-1` fire. The expectation was corrected, not the test.
  - Control K10 first ran `t2 compare` without regenerating the mutant's fingerprint (it lives in /tmp) and read 10/10; it now runs `t2` on both legs,
    compares, and regenerates the restored fingerprint.
  - The version widening's first pattern for `vercensus` was three digits exactly and `t21` failed: its synthetic tag `v5999` is four. Now `/^v\d{3,}$/`.
  - `t10`'s gating edit spliced one character twice (`NNJ(`) on its first pass; the suite died loudly on load and the ten sites were corrected.
- **Sources** re-read in the session (after a research pass): IT-2105-I 2026 (rate rows and worksheet 1, single and joint), SCDOR IL 26-20 and the ratified
  H.4216 text (§12-6-1170 unamended), MN DOR's TY2026 table, the 2026 Wisconsin 1-ES, FTB Tax News October 2025 and the 2026 540-ES instructions (BHST),
  the NJ Division of Taxation schedules, OR-ESTIMATE 2026, Va. Code §58.1-320, and the MS DOR rate page (its own text disagrees with its table; the statute,
  HB 1 2025, settles 4 % for 2026). Oklahoma's schedule was read at v5.97 (HB 2764, OTC summary) and confirmed against OW-2's arithmetic.
- **Suite:** 5,395 app checks, 63 suites, 0 failed, 0 DIED; GRAND 5,525. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v599 v600 from a full clone of 5c90d85 with the github/ files overlaid (v5.99 resolved from history, commit f7ce172), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5303, half B GRAND 222; none DIED.
