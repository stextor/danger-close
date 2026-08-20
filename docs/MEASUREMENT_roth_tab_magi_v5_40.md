# MEASUREMENT rev 2 — the Roth tab's IRMAA MAGI, validated end-to-end

| Field | Value |
|---|---|
| Supersedes | revision 1 of this file (2026-08-20). **Revision 1 contains two errors of mine; both are corrected here and named in §1.** |
| Build | **v5.40** · md5 `6b7cebb1476ee66e57079b713b94ba75` · committed tree re-verified unchanged |
| Steps | §3 steps 1–5 **all complete.** Step 3 closed this session (render + Engine C legs) |
| Harness | t1 108/108 · t3 36/36 · t17 74/74 against v540 before any measurement was trusted |
| Source changed | **None.** No `src/` edit, no version bump, no suite file touched |

---

## 1. Two errors in revision 1 — mine, and one was material

**Error A — the household's date of birth. Material.** Revision 1 used `dobA` = **1963-09-01**,
taken from the fallback literal at L641. That fallback never fires. `DEFAULT_PORTFOLIO` carries no
`dobA`, so `_parseDOB(mp, "Spouse A")` runs first and finds `MASTER_PROMPT` L151:
`Spouse A: DOB 01/01/1964`. **The example household is 1964-01-01.** I verified a line and not the
precedence chain around it, which is precisely the failure "verify, don't recall" exists to prevent.

Consequences, all corrected below: `rothLadderEndA` is **2038** not 2037; spouse A's first RMD year
is **2039** not 2038; the tail is **two ladder years, not three**; spouse A claims SS in **2031** not
2030. Revision 1's headline of −$139,095 was wrong; the figure is **−$94,441**.

Caught by Engine C, whose RMD-driven MAGI jump appeared in 2039–2040 where revision 1 predicted
2038–2040. This is another instance of a hand figure being wrong in a way only a second, independent
computation exposed.

**Error C — a third tool bug, found during the slider re-run.** `conv` was
`Math.min(rothAmount, grown)` with no floor, so once an RMD drove a balance below zero the tool
returned a **negative conversion** (observed: slider $175,000, ladder year 2040, conv = −$1K).
Floored at 0, balances floored too, commented at the site; full-sweep check now reports zero negative
conversions or RMDs. Only reachable in the exhausted-balance region, so no headline figure moved —
but it is the third defect in my own tooling this session, and the reason the >$170,000 region is
explicitly disclaimed above rather than reported.

**Error B — a bug in my own tool. Not material to revision 1's totals, but it was live.**
`ladder_hand.mjs` computed the SS partial-year as `12 - ssAmo + 1`, using the monthly **amount**
($3,300) where the start **month** belonged. `Math.max(0, …)` swallowed the negative, so spouse A's
benefit was silently **zeroed in her claim year**. Caught by a $33,660 disagreement with Engine C in
2031. Fixed (`ssAstartMonth`), commented at the site. Revision 1's totals happened not to move
because its wrong DOB put the claim year where the bug's effect was masked — an accident, not a
reprieve.

---

## 2. Step 3 closed: the rendered figure IS the variable

The scope's caution was that L9118 prints `MAGI $XXXK`, rounded to thousands, so *"the rendered
figure is the claim, not the variable."* Mounted in jsdom, example household loaded, Roth tab
navigated:

| Ladder year | Rendered `MAGI $XXXK` | `magi` at L8847 | Match |
|---|---|---|---|
| 2029 | **$108K** | $108,060 | ✓ |
| 2030 | **$106K** | $106,060 | ✓ |
| 2031 | **$137K** | $136,720 | ✓ |
| 2032–2040 | **$122K** ×9 | $121,720 | ✓ |

**All 12 years agree.** L8847 is what reaches the screen; the transcription revision 1 relied on was
correct, and the rounding hides nothing at this scale. The measurement is validated end-to-end.

The run also captured the tab's **own** rendered tier-1 thresholds — `Thr $241K` rising to `$299K`
across 2029–2040 — which replaces my indexation assumption in §5 with the app's actual series.

---

## 3. Three-way comparison (step 3, Engine C leg)

`computeIrmaaPlan({retireYear: 2029, rothAmount: 70000, qcdAnnual: 0, taxYield: 2.0})`, driven
through `__engines`:

| Year | Roth tab (rendered) | Hand, from statute | Engine C | Hand − Engine C | Tab − hand |
|---|---|---|---|---|---|
| 2029 | $108,060 | $108,480 | $108,780 | −$300 | −$420 |
| 2030 | $106,060 | $106,480 | $106,780 | −$300 | −$420 |
| 2031 | $136,720 | $137,140 | $137,440 | −$300 | −$420 |
| 2032–2038 | $121,720 | $122,140 | $122,440 | −$300 | −$420 |
| **2039** | $121,720 | **$167,131** | $166,103 | +$1,028 | **−$45,411** |
| **2040** | $121,720 | **$166,550** | $165,289 | +$1,262 | **−$44,830** |

**The hand figure and Engine C agree to exactly −$300 in all ten non-RMD years**, and the $300 is
fully explained: Engine C's dividend base is $36,000 (the $21,000 brokerage **plus the $15,000 HSA**)
against my $21,000. I excluded the HSA deliberately — HSA earnings are not includible in AGI, so
they do not belong in IRMAA MAGI under 42 U.S.C. §1395r(i)(4). **Engine C overstates MAGI by $300/yr
on this household.** Conservative direction, small, and about Engine C rather than the Roth tab —
recorded, not acted on.

In the two RMD years the figures differ by ~$1,100 (0.7%) because Engine C tracks its own Traditional
balance while my tool apportions one pot pro-rata. Two independent computations agreeing to under 1%
on the term that carries the finding is the corroboration this measurement needed.

---

## 4. HH1 corrected — the shipped example household

| Term | Total over 12 ladder years | Share |
|---|---|---|
| SS treatment | **$0** — exact in every year at the $70,000 default | — |
| Omitted RMD | **−$89,401** | **94.7%** |
| Omitted dividends | −$5,040 | 5.3% |
| Omitted realized gains | $0 | — |
| **Net** | **−$94,441** | 0 years over, **12 under** |

The RMD term is concentrated entirely in **2039 and 2040**, at ~$45,000 each — a **37%
understatement** of those years' MAGI. Direction is the non-conservative one, as §6 of the parent
scope originally suspected.

### Slider sensitivity — RE-RUN 2026-08-20, supersedes revision 1 §3

Revision 1's table was computed on the wrong `dobA` and carried a "do not quote" warning. Re-run with
`dobA` 1964, the `ssAstartMonth` fix, and a third tool fix (see §1, Error C). Tier flips are tested
against the tab's **own** rendered thresholds.

| Slider | Net error | SS term | RMD term | Yrs over | Yrs under | **Tier flips** |
|---|---|---|---|---|---|---|
| $0 | −$214,636 | −$57,447 | −$152,149 | 1 | 11 | **0** |
| $10,000 | −$204,382 | −$56,157 | −$143,185 | 1 | 11 | **0** |
| **$15,000** | **+$154,277** | **+$298,020** | −$138,703 | 10 | 2 | **0** |
| $25,000 | +$85,855 | +$220,634 | −$129,739 | 8 | 4 | **0** |
| $35,000 | +$26,819 | — | — | — | — | **0** |
| $40,000 | −$2,699 | +$118,634 | −$116,293 | 8 | 4 | **0** |
| $60,000 | −$103,405 | $0 | −$98,365 | 0 | 12 | **0** |
| **$70,000 (default)** | **−$94,441** | **$0** | **−$89,401** | 0 | **12** | **0** |
| $150,000 | −$22,729 | $0 | −$17,689 | 0 | 12 | **0** |
| $400,000 | −$6,720 | −$1,680 | $0 | 0 | 12 | **0** |

**The overstating band is wider than revision 1 reported** — the net is positive from about $15,000
to about $35,000, not $15,000–$20,000 — and the SS term in it is far larger (+$298,020 at $15,000
against revision 1's implied figure). The default remains firmly in the understating region.

**Zero tier flips at every slider position**, against the app's own thresholds. On this household no
conversion amount makes the MAGI error change the IRMAA verdict. That is a property of *this*
household sitting far below the tier-1 edge, not of the defect — HH3 (§5) flips 8 of 8.

**Above ~$175,000 the sweep is not a finding.** Verified rather than assumed this time: at $175,000
the conversion first falls short of the slider in 2039, at $200,000 in 2037, at $300,000 in 2034. The
ladder exhausts the Traditional balance before the RMD years, the RMD term drops to $0, and the
residual ±$25,000 oscillation is the SS term crossing the §86 ceiling as conversions fall away.
**Read nothing into sign changes above $170,000.**

---

## 5. Step 5 — the tier consequence, now against the app's own thresholds

Rendered MAGI runs $106K–$137K; the tab's own rendered tier-1 threshold runs $241K–$299K. The
statutory figure peaks at $167,131 in 2039, against a rendered threshold of $293K that year.

**HH1: 0 of 12 ladder years change the IRMAA verdict.** HH2 (the constructed high-omission
household, §4 of revision 1, unaffected by Error B since its SS claim years fall outside its ladder):
**0 of 8.** Both confirmed against the app's own threshold series rather than my indexation.

### HH3 — the straddling household, and it changes the answer

Revision 1 named this gap and did not close it. Closed now. HH3 keeps HH2's 1959/1962 split RMD ages
(five tail years) and scales the household so the app's figure sits **under** the tier-1 edge while
the statutory figure sits **over**: $3.0M pre-tax, $1.5M taxable sleeve, $3,000/mo pension,
$120,000/yr conversions.

| Year | MAGI app | MAGI law | App's own threshold | App says | Law says |
|---|---|---|---|---|---|
| 2029–2031 | $215,160 | $305,160 | $241K–$250K | ✓ no IRMAA | ⚠ **triggered** |
| 2032–2036 | $215,160 | $404,703–$405,456 | $255K–$276K | ✓ no IRMAA | ⚠ **triggered** |

**8 of 8 ladder years render the wrong IRMAA verdict.** The tab shows a green ✓ in every year of a
ladder where the statute triggers a surcharge in every year. Net MAGI error −$1,219,941, of which
RMD −$499,941, realized gains −$480,000, dividends −$240,000.

**This is the finding that answers D-C.** The defect is not merely arithmetic hygiene: for a
household well inside the mainstream-couple-near-retirement frame, it inverts the user-facing
warning the tab exists to give, in every single year.

---

## 6. Revised recommendation

Revision 1 recommended `rmdTax_y` first on the strength of its 94.7% share on the example household.
**HH3 changes the ordering argument, though not much of the ordering.**

1. **`rmdTax_y` still first.** Largest single term on both HH1 (94.7%) and HH3 (41%), needs no new
   plumbing, and the ladder loop already tracks the balance it needs.
2. **`div_y` and `capGain_y` are no longer deferrable.** Together they are **59%** of HH3's error and
   they are what carries the verdict inversion in HH3's first three years, before any RMD exists.
   Revision 1 wanted them held pending this household; the household now exists and argues for them.
   The `gainByYr` plumbing cost is real and belongs in that scope.
3. **The SS cliff last, on severity** — though it remains the cheapest fix (swap L8841–8844 for the
   existing `taxableSSPortion`). It contributed **$0** on all three households, because every one of
   them converts enough to push provisional income past the point where §86 reaches its ceiling. It
   is a genuine defect in a band the default does not occupy. Cheap, correct, low urgency.

**Disclosure (parent scope D4)** is now writable with a number and a caveat that is honest in both
directions: the Roth tab's IRMAA MAGI omits required distributions, dividends and realized gains;
on the shipped example household this understates it by about $45,000 in each of the two years after
RMDs begin without changing the tier shown; on a household with a large taxable sleeve it can show
no IRMAA warning in years where one is due.

---

## 7. Incidental findings, still recorded not acted on

1. **Spouse B's SS has no start-year gating** (L8822, `const spouseBSS = _rsSsB * 12;`). Spouse A is
   gated one line below. Inflates `totalSS` for any household whose ladder opens before B claims.
2. **`magi` and `grossTaxable` are the same expression on consecutive lines** (L8847, L8850) — any
   fix moves the tab's tax, marginal rate and headroom too.
3. **Engine B's `taxableSSPortion` omits §86(a)(2)(A)(ii)'s inner ½-benefits cap** — max $2,375,
   benefits under $12,000 only, never understates.
4. **Engine C's dividend base includes the HSA** — $300/yr on the example household, overstates.

Items 1, 3 and 4 are all small, all conservative in direction, and all belong in one tidy-up scope
rather than four.

---

## 8. Tooling added (asserts nothing, counted in no total — OPERATIONS §B1)

`qa/tools/hand_86.mjs` · `ladder_hand.mjs` · `engineC_threeway.mjs` · `render_check.mjs` · `hh3.mjs`
