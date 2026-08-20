# MEASUREMENT — the Roth tab's IRMAA MAGI, hand-computed from primary sources

| Field | Value |
|---|---|
| Scope | `SCOPE_ROTH_TAB_MAGI_MEASUREMENT.md` §3, resumed after `STOP-REPORT-v5_40-roth-tab-section86.md` |
| Build | **v5.40** · `src/DangerClose.jsx` md5 `6b7cebb1476ee66e57079b713b94ba75` · verified unchanged after the stop-report push |
| Decisions | D-A both households · D-B include the SS term · **D-D resolved (i): revise and resume** |
| Source changed | **None.** No `src/` edit, no version bump, no suite file touched |
| Steps complete | §3 steps 1, 2, 4, 5 · **step 3 partial — see §6** |
| Tooling | `qa/tools/hand_86.mjs`, `qa/tools/ladder_hand.mjs` — assert nothing, counted in no total |

---

## 1. Headline

**At the shipped default the app understates IRMAA MAGI, and the Social Security cliff never fires.**
Both my stop report and the scope's original §1 over-generalised in opposite directions. The truth is
conditional on the conversion slider, and neither document had computed it.

| | Shipped example household | Constructed household |
|---|---|---|
| Ladder | 2029–2040 (12 yrs) | 2029–2036 (8 yrs) |
| Net error, whole ladder | **−$139,095** | **−$678,265** |
| Years app overstates | **0 of 12** | **0 of 8** |
| Years app understates | **12 of 12** | **8 of 8** |
| SS-term error | **$0 — exact in every year** | **$0 — exact in every year** |
| **Ladder years in a different IRMAA tier** | **0 of 12** | **0 of 8** |

Negative = the app reports **less** MAGI than the statute requires: the non-conservative direction,
which is what §6 of the parent scope originally suspected.

---

## 2. Households (§3 step 1, D-A)

**HH1 — the shipped example household**, hand-evaluated from `DEFAULT_PORTFOLIO`:
`dobA` 1963-09-01, `dobB` 1966-03-01 (both 1960+, so both take RMDs at 75), retire 2029, `ssA`
$3,300/mo at 67, `ssB` $1,300/mo at 63, pension $400/mo. Seed Traditional, evaluated through
`retireStartBalances(2029)` with `asOf` 2026: **A $1,180,000** (positions $1,000,000 + accrual
$90,000 + Rollover/Traditional IRAs $90,000), **B $218,600** (positions $185,000 + accrual $12,600 +
state plan $14,000 + annuity $7,000). Taxable sleeve **$21,000**. Slider at its **$70,000 default**.

**HH2 — constructed to make the omissions bite.** Identical except `dobA` **1959** and `dobB`
**1962**. That straddles the SECURE 2.0 band edge — 1959 takes RMDs at 73, 1962 at 75 — so a
three-year age gap produces a **five-year tail** of live, omitted RMDs (2032–2036) rather than HH1's
three. Taxable sleeve raised to **$900,000** and $40,000/yr of realized gain, so `div_y` and
`capGain_y` are non-trivial.

---

## 3. HH1 — the shipped example household, per ladder year

| Year | Age A | Conv | RMD | Div | taxSS app | taxSS law | MAGI app | MAGI law | Δ |
|---|---|---|---|---|---|---|---|---|---|
| 2029 | 66 | $70,000 | — | $420 | $13,260 | $13,260 | $108,060 | $108,480 | −$420 |
| 2030 | 67 | $70,000 | — | $420 | $13,260 | $13,260 | $106,060 | $106,480 | −$420 |
| 2031 | 68 | $70,000 | — | $420 | $46,920 | $46,920 | $136,720 | $137,140 | −$420 |
| 2032–2037 | 69–74 | $70,000 | — | $420 | $46,920 | $46,920 | $121,720 | $122,140 | −$420 |
| **2038** | **75** | $70,000 | **$45,351** | $420 | $46,920 | $46,920 | $121,720 | **$167,491** | **−$45,771** |
| **2039** | **76** | $70,000 | **$44,786** | $420 | $46,920 | $46,920 | $121,720 | **$166,926** | **−$45,206** |
| **2040** | **77** | $70,000 | **$43,919** | $420 | $46,920 | $46,920 | $121,720 | **$166,059** | **−$44,339** |

### Term decomposition (§3 step 4) — app minus law, 12 years

| Term | Total | Note |
|---|---|---|
| SS treatment | **$0** | exact in all 12 years at the default slider |
| Omitted RMD | **−$134,055** | entirely 2038–2040, the three tail years |
| Omitted dividends | **−$5,040** | $420/yr on a $21,000 sleeve at the tab's own 2.0% `taxYield` |
| Omitted realized gains | $0 | household models none |
| **Net** | **−$139,095** | **96.4% of the error is the RMD term** |

**§1(b) of the scope is confirmed and quantified.** `rothLadderEndA` = 2037, `rothLadderEndB` = 2040,
ladder ends 2040; spouse A's first RMD year is 2038. **Three ladder years carry a live, omitted RMD**,
each about $45,000 — a 37% understatement of that year's MAGI.

### Why the SS term is exact here, and when it is not

A $70,000 conversion puts provisional income at $102,400. §86's phase-in has already reached its
0.85 × benefits ceiling by then, so the statute and the app's cliff agree exactly. Solving for where
they diverge on this household: the statutory formula reaches the ceiling at provisional ≈ **$92,141**,
i.e. a conversion of about **$59,741**. Below the adjusted base amount there is no divergence either.
So the SS defect is live only for conversions between roughly **$11,600 and $59,741** — a real band,
containing many plausible slider positions, but **not containing the shipped default.**

### Sensitivity to the slider (this is the part neither prior document had)

| Slider | Net error | Years over | Years under |
|---|---|---|---|
| $0 | −$331,719 | 1 | 11 |
| $10,000 | −$312,762 | 1 | 11 |
| **$15,000** | **+$51,585** | **9** | 3 |
| **$20,000** | **+$20,075** | **8** | 4 |
| $25,000 | −$4,634 | 7 | 5 |
| $50,000 | −$116,890 | 6 | 6 |
| **$70,000 (default)** | **−$139,095** | **0** | **12** |
| $150,000 | −$37,776 | 0 | 12 |

The net changes sign between $10,000 and $15,000 and again between $20,000 and $25,000. **The error's
direction is a function of a user-controlled slider**, which is why no amount of further reasoning
would have settled it. Above about $170,000 the sweep produces further sign changes, but there the
conversion begins exhausting the Traditional balance (`conv_y = min(rothAmount, grownTrad)`) and the
comparison is dominated by depletion dynamics rather than MAGI assembly — I would not read those
flips as findings.

---

## 4. HH2 — the constructed household

| Year | Age A | Conv | RMD | Div | Gain | MAGI app | MAGI law | Δ |
|---|---|---|---|---|---|---|---|---|
| 2029 | 70 | $70,000 | — | $18,000 | $40,000 | $141,720 | $199,720 | −$58,000 |
| 2030 | 71 | $70,000 | — | $18,000 | $40,000 | $139,720 | $197,720 | −$58,000 |
| 2031 | 72 | $70,000 | — | $18,000 | $40,000 | $136,720 | $194,720 | −$58,000 |
| **2032** | **73** | $70,000 | **$43,823** | $18,000 | $40,000 | $121,720 | **$223,543** | **−$101,823** |
| 2033 | 74 | $70,000 | $43,556 | $18,000 | $40,000 | $121,720 | $223,276 | −$101,556 |
| 2034 | 75 | $70,000 | $43,025 | $18,000 | $40,000 | $121,720 | $222,745 | −$101,025 |
| 2035 | 76 | $70,000 | $42,393 | $18,000 | $40,000 | $121,720 | $222,113 | −$100,393 |
| 2036 | 77 | $70,000 | $41,468 | $18,000 | $40,000 | $121,720 | $221,188 | −$99,468 |

| Term | Total | Share |
|---|---|---|
| SS treatment | $0 | — |
| Omitted RMD | −$214,265 | 31.6% |
| Omitted dividends | −$144,000 | 21.2% |
| **Omitted realized gains** | **−$320,000** | **47.2%** |
| **Net** | **−$678,265** | |

**`capGain_y` is the largest single omission once the taxable sleeve is funded** — and it is the term
the scope flagged as the awkward one to fix, because the Roth block has no `gainByYr` in scope. The
measurement confirms the awkward term is also the expensive one. In the worst year the app reports
**$121,720 against a statutory $223,543 — a 45.6% understatement.**

---

## 5. Step 5 — the tier consequence, which is the surprise

The scope was right to insist on this: *"MAGI that differs by $9,000 matters only if it crosses a
tier edge."*

Against the CMS 2026 joint tier edges ($218,000 / $274,000 / $342,000 / $410,000 / $750,000, fact
sheet of 14 Nov 2025), indexed forward to each premium year:

**Zero ladder years land in a different IRMAA tier. 0 of 12 for HH1, 0 of 8 for HH2.**

Both households sit in tier 0 on both the app's figure and the statutory one, in every year, because
the joint tier-1 edge has grown to roughly $250,000–$350,000 by the relevant premium years while
neither household's MAGI exceeds $224,000. The result is robust to the indexation assumption: at the
app's own 2% `TAX_INDEX_RATE` rather than CMS's recent ~3%, the 2040 edge is still about $287,600,
comfortably above both figures.

**So the tab's rendered IRMAA warning is not wrong for either household, despite MAGI being
understated by up to 45.6%.** The defect is real arithmetic that currently changes no user-visible
verdict on these two households.

⚠ **The obvious gap, and I did not close it.** Neither household was constructed to *straddle* a tier
edge, and that is precisely the case where the omissions would flip the warning. A household with
~$200,000 of MAGI two years before a Medicare year would cross tier 1 on the statutory figure and not
on the app's. That construction is a third household and it is the one that would decide whether this
is user-visible. It should be run before D-C is answered.

---

## 6. What is still not done

- **§3 step 3 is partial.** I compared the hand figure to the Roth tab's *transcribed expression*, not
  to its **rendered** DOM figure, and not to **Engine C's output**. No engine was run this session —
  deliberately, to keep the hand computation independent, and then budget ran out. The scope is
  explicit that the rendered number is the claim (L9118 prints `MAGI $XXXK`, rounded to thousands),
  so this is a genuine remaining leg, not a formality.
- **The threshold-straddling third household** (§5 above).
- **The app's `irmaaThresholdFor` inflator** was not read; §5 uses my own indexation, disclosed.

---

## 7. Incidental findings, recorded not acted on

1. **Spouse B's Social Security has no start-year gating.** L8822 is
   `const spouseBSS = _rsSsB * 12;` — a full year of benefit in **every** ladder year, including years
   before spouse B claims. Spouse A is correctly gated one line below. For HH1 the ladder starts the
   same year B claims (2029), so it cannot bite; for any household whose ladder opens before B's claim
   age it inflates `totalSS`, `provisional` and `taxableSS`. Not this scope's target.
2. **`magi` and `grossTaxable` are the same expression on consecutive lines** (L8847, L8850), so the
   tab's conversion tax, marginal rate and 24%-bracket headroom all inherit whatever the MAGI
   expression gets wrong. Any fix must treat them as one unit.
3. **Engine B's `taxableSSPortion` omits §86(a)(2)(A)(ii)'s inner ½-benefits cap** — max $2,375,
   confined to benefits under $12,000, never understates. Carried forward from the stop report; still
   needs its own scope.

---

## 8. What this means for the decisions

**D-C — is a fix in the product boundary?** The measurement gives a mixed answer, honestly:

- *For the fix:* the omissions are large in dollars (up to 45.6% of a year's MAGI), the RMD term
  alone is 96% of the error on the shipped household, and the app already contains a correct §86
  worksheet to call.
- *Against urgency:* on both households measured, **not one ladder year changes IRMAA tier**. The
  number on screen is wrong; the verdict it drives is not.

My recommendation is to **split it**, on the evidence rather than on tidiness:

1. **`rmdTax_y` first** — it is 96% of the error on the shipped example household, it is three lines
   of arithmetic against a balance the ladder loop already tracks, and it needs no new plumbing.
2. **The SS cliff second** — swap L8841–8844 for the existing `taxableSSPortion`. Correct and cheap,
   but it moves `grossTaxable`, so it needs its own census and extinction invariants.
3. **`div_y` / `capGain_y` last, and only after the straddling household is run.** They are the
   expensive plumbing (no `gainByYr` in scope) and the case for them rests entirely on whether a
   threshold-crossing household exists.

**D4 of the parent scope — the Field Manual disclosure** — is now writable, and can say something
specific and true: that the Roth tab's IRMAA MAGI omits required distributions, dividends and
realized gains, that on the shipped example household this understates it by about $45,000 in each of
the three years after RMDs begin, and that on that household it does not change the IRMAA tier shown.
Whether to ship that disclosure before or with the fix is yours.
