# SCOPE — D-22 (part) · Georgia's and Oklahoma's 2026 rates (v5.97)

**FULFILLED — shipped as v5.97 (2026-10-08).** Repo-only. §7 is the build record. D-22 itself stays open for the other 40 rates.

*(Superseded status line, retained:)* **READY — 2026-10-08.** Steve decided the order on 2026-10-08: after v5.96, D-22's two known misses (Georgia and Oklahoma) as v5.97.
Under his standing instruction every decision below carries a recommendation the build takes and records. **Stop only where §5's
conditions fire.** The other 40 nonzero rates stay open under D-22.

## 0 · Premise (verified against v5.96, not assumed)

Freshness (OPERATIONS §A): repo `54dcc09`, full clone; source `2431abbb17ab7c21bd6cc73b84decd41` = repo = pool (hashed through the
Projects tool, 2026-10-08) = CHANGELOG newest; built `11bbf9af0ea25c03f8009c7e57e0b792`. The pool lists 124 entries (Projects listing).

**The model, read by AST (`STATE_RULES`):** Georgia `rate: 0.0519`, note "…flat rate stepping down"; Oklahoma `rate: 0.0475`, note
silent on the rate. Each row's rate is one effective flat rate applied to every model year (OPERATIONS-documented approximation; the
state module holds "current law" for every future year, as the federal brackets do).

**The law, read at primary sources on 2026-10-08:**
- **Georgia — 4.99 % for taxable years beginning on or after 1 January 2026.** O.C.G.A. §48-7-20(a.1) as amended by HB 463 (2026),
  Ga. L. 2026, p. 397, signed 11 May 2026 and retroactive to 1 January 2026. Confirmed by the Department of Revenue's *2026 Employer's
  Tax Guide* (updated June 2026): "reduced from a flat rate of 5.19% to a flat rate of 4.99%… retroactive to taxable years beginning on
  or after January 1, 2026", and by the Governor's signing release. The statute then steps the rate down 0.125 a year from 1 January 2027
  to 3.99 % (delayed a year for each year the standard-deduction reductions are delayed), and HB 463 raises the retirement exclusion to
  $70,000 from 2027. Georgia's tax is flat, so 4.99 % is the statutory rate exactly.
- **Oklahoma — top rate 4.5 % from tax year 2026**, three brackets above a 0 % band: single 0 % to $3,750, 2.5 % to $4,900, 3.5 % to
  $7,200, 4.5 % above; joint (and head of household, surviving spouse) 0 % to $7,500, 2.5 % to $9,800, 3.5 % to $14,400, 4.5 % above.
  HB 2764 (2025), amending 68 O.S. §2355, effective 1 November 2025 — Oklahoma Tax Commission, *2025 Tax Legislation Summary* (Tax
  Policy Division). Further 0.25-point cuts follow revenue triggers certified by the State Board of Equalization (62 O.S. §34.103).
  **The model's 4.75 % was Oklahoma's previous TOP rate**, so the row follows a top-rate convention; applying the top rate to all of a
  base above $7,200 / $14,400 overstates tax by exactly $214.75 single / $429.50 joint a year against the bracket schedule (computed:
  4.5 % × $7,200 = $324.00 less the schedule's $109.25; joint 4.5 % × $14,400 = $648.00 less $218.50).

**Direction:** both rows overstated tax (conservative). The correction lowers modelled tax — correct beats conservative, by explicit
decision, as Kentucky's rate at v5.57.

**Measured** (a scratch probe with only the two rates changed, not shipped; `/home/claude/w/qa/m22.mjs`):
- **Engine B** (Taxes tab, example household, lifetime state tax): Georgia $20,678 → $19,881 (−$797) at no conversions, $8,966 → $8,620
  at $70,000/yr; Oklahoma $67,852 → $64,281 (−$3,571), $71,012 → $67,275. Every other jurisdiction (and no state) byte-identical, rows
  and all. Each change is exactly the rate ratio (4.99/5.19, 4.5/4.75) — the rate is a scalar on the state bill.
- **Engine A** (Roth comparator, 51 jurisdictions, three households): 12 strategy runs fall per household (six strategies × GA, OK),
  **none rise**, and the estate-best strategy changes in **no** jurisdiction for any of the three. No-conversion lifetime tax:
  example GA −$1,623, OK −$4,804; an early widow (H1) GA −$6,202, OK −$11,503; H2 GA −$2,806, OK −$6,381.
- Engines C and D compute no state tax.

## 1 · Decisions (taken on recommendation; record each in §7)

- **D22-1 — the rates.** Georgia `0.0499`; Oklahoma `0.045`, keeping the row's top-rate convention (the conservative reading; the
  overstatement above is disclosed in the note). *Alternative:* an "effective" Oklahoma rate below 4.5 % — rejected: it would be a number
  of our own making with no source, and the module's rule is that a rate is a reading, not a derivation.
- **D22-2 — where the reading is recorded.** In each row's **note** (rate, tax year, enacting act and code section), as Kentucky's and
  Utah's notes already do — **not** in the `years` field, which D18-1 reserves for dollar figures and which My Data renders; adding a
  `rate` key there would change My Data's dated line and `t51`'s census for two rows only. Revisit when D-22 reads the other 40.
- **D22-3 — later years.** Both rates are held flat for every later year, as every state is. Georgia's statutory step-down from 2027
  and Oklahoma's triggered cuts are not applied (conservative), and each note says so.
- **D22-4 — Georgia's $70,000 exclusion from 2027 is not applied** (the row's dollar figures are TY2026, `years.excl65: 2026`); the note
  says so (conservative). Revisit with the TY2027 refresh.
- **D22-5 — the parity guardrail.** `t2`'s `stateTax` fingerprint is a Georgia call; it must move. Declare `"v596→v597": ["stateTax"]`
  in `INTENDED_DIFFS`, so the nine other keys stay byte-identical and a revert fails the guardrail.
- **D22-6 — disclosure.** The notes (shown in My Data) are the in-app disclosure, as for Kentucky at v5.57; no Field Manual change. CHANGELOG,
  METHODOLOGY (§6, a dated line) and MissingFeatures D-22 (two of 42 read; 40 open).
- **D22-7 — Oklahoma's note keeps the word "law" out** — `t52` T-OK1 asserts the note claims no law age, by testing for that word; the
  rate clause cites "HB 2764 (2025), 68 O.S. §2355" instead.

## 2 · Site census (AST, `/home/claude/w97/ratecensus.cjs`, literals incl. JSX text and regexes)

**Source:** two sites — `STATE_RULES.GA.rate` and `STATE_RULES.OK.rate` (plus their notes). No string, template, JSX text or regex in the
source names 5.19 or 4.75 (the Field Manual included). The other `0.045` literals are Alabama's rate, `BASE_GROWTH` and scenario returns.
The "e.g. 4.99" in the flat-rate input is an example, unrelated.

**Suite:** literal pins of the old rates — `t52` M-GA1, M-OK1, M-OK2 (hand figures from 5.19 % and 4.75 %); `t58` group 0 (GA 5.19 %) and
its Georgia hand cases; `t59` group 0 and the GA survivor figures; `t60` group 0 and B-GA ($1,816.50). **Derived pins a literal census
cannot see** — figures computed from the rate (`t33`'s Georgia household, `t3`'s, `t2`'s `stateTax`) — are found by running the suite on
the staged build, and each is version-gated, never re-pinned for every leg.

## 3 · Tests

New suite **`t61_ga_ok_rates.mjs`**, both legs (the v5.96 leg pins the old rates):
- **A** — the rates and the notes: GA and OK rates per leg; on v5.97 each note names its rate, year and source and the not-applied later
  changes; a guard over all 51 rows that **any note stating a rate "for/effective/from" a year equals the row's own rate** (KY, UT, NC,
  GA, OK today), so a note and its constant cannot drift.
- **B** — hand cases to the cent through `stateTaxAnnual`: GA 66 $100,000 IRA → $1,746.50 (= 4.99 % × $35,000; v5.96 $1,816.50); GA 63
  $50,000 → $2,495.00; OK 66 single $50,000 → $1,800.00 (= 4.5 % × $40,000); OK joint 65/65 $100,000 → $3,600.00; OK 64 $50,000 → $2,250.00.
- **C** (v5.97 leg, needs the v5.96 bundle) — every jurisdiction × a grid of households: v5.97 equals v5.96 exactly except GA and OK, and
  there the ratio is exactly the rate ratio; Engine B on the example household: only GA/OK rows move and only `stateTax`, `totalTax`,
  `effRate`; Engines C, D byte-identical; Engine A never rises.
- Controls `qa/tools/controls_v597_rates.py` (repo-only): each rate reverted; each note's rate clause dropped; a note stating a wrong
  rate; another state's rate moved (C must fire); `t2`'s declaration removed (parity must fire).

## 4 · Out of scope

The other 40 rates (D-22 stays open); Oklahoma's bracket schedule (a progressive module is a different release); Georgia's 2027 exclusion
and step-down; Oklahoma's age condition (unchanged, still "not verified").

## 5 · Stop conditions

Stop and report if: a primary source contradicts §0; anything other than GA and OK moves in group C; Engine A rises anywhere; `t2`
moves a key other than `stateTax`.

## 7 · Build record (v5.97, 2026-10-08)

- **Source** `4157137a9ce50db365a1a190fa10f617` (6 anchors, each once on v5.96: two rows, four version sites); the §0 scratch measurement reproduced exactly by `t61` C-4/C-5.
  **Built** `42c082a242cb157ee6de8044f5ca9db8` (v5.96 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — only GA and OK move; Engine A never rises; `t2` moved `stateTax` only (MC parity 10/10 with the declaration).
- **`t61`** 23 (v5.97) / 12 (v5.96). **Controls 8 of 8.** Derived pins gated per build: `t52`, `t58`, `t59`, `t60` (found by the AST
  census), `t33` (found by the run, as §2 predicted).
- **Controls:** the first run's K7 reported its unmutated baseline red — it searched for a passing line `t2` does not print; corrected to read the
  tally, then 8 of 8.
- **Correction to §3:** `A-6`'s expected set first omitted **Ohio**, whose note states "~3.1% for 2026" — and equals its rate. The guard did its job on
  the first run; the expectation was widened, not the guard.
- **Suite:** 5,259 app checks, 60 suites, 0 failed, 0 DIED; GRAND 5,389. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v596 v597 from a full clone of 54dcc09 with the github/ files overlaid (v5.96 resolved from history, commit 2d61c3c), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5167, half B GRAND 222; none DIED.
