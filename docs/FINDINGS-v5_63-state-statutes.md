# FINDINGS — the five income-conditioned states, read against primary sources

**What this is.** The pre-build gate that `SCOPE_INCOME_CONDITIONING.md` §8 requires (steps 2 and 3),
executed 2026-09-04 against shipped **v5.63**, source `b2deba49e68bee6c29300f2f8cf0a7e3`, repo HEAD
`4ca47a5`. It exists so the build session encodes figures it can cite rather than figures it
inherited. **Every table below was read from a primary or official source in the session that wrote
this file.** Nothing here is carried from `AUDIT_STATE_INCOME_BASES_ROUND5.md` on trust, though
everything here agrees with it.

**No code was changed.** No source edit, no version bump, no suite change. v5.63 remains current.

| | |
|---|---|
| Anchor | v5.63, `b2deba49e68bee6c29300f2f8cf0a7e3`, built `index.html` `5998e8b60c5f45ded623d500fce09a86` |
| Suite at this anchor | **3,010 app checks / 0 failing** (3,092 / 0 including t21 50 and domdiff 32), parity 10/10 — run this session, `./qa/runsuite.sh v562 v563` from a fresh clone |
| §2.1 census | re-run: 4 AST hits, definition **L1114**, calls **L4003 / L4128 / L5283** — the scope's premise holds |
| `STATE_RULES` | AST dump: **L1028, 51 entries**, six fields on all 51, `exclAge` on 4, `ssOffset` on 2 — unchanged |

---

## 1 · What was read, and where

| state | source read this session | standing |
|---|---|---|
| **NM** | **N.M. Stat. § 7-2-5.2 (2025 code)**, all three tables in full · **§ 7-2-7 as amended by Laws 2024 ch. 67 § 5**, effective 1 Jan 2025, all three rate schedules | verified |
| **CT** | **Form CT-1040ES (Rev. 01/26)** — the **TY2026** Pension and Annuity Phase-Out Table and worksheet, read in full | verified, TY2026 |
| **NJ** | **A5539 / S3954 (P.L. 2021 c.129)** chaptered text of the tier amendment, corroborated by S3689 (introduced Feb 2026) restating current law | verified |
| **VA** | **Va. Code § 58.1-322.03(5)(b)** (law.lis.virginia.gov) · **Form 760 Age Deduction Worksheet**, line structure from the official 2025 instructions · Tax Commissioner ruling 22-19 | verified, incl. worksheet mechanics |
| **RI** | **ADV 2025-22** (tax.ri.gov) threshold table · **PUB 2026-01** Retirement Income Guide, the conflicting figure | verified, and the conflict re-confirmed |

⚠ **One limit worth stating.** Connecticut is read at TY2026, which is the year the app models.
The other four are read at their current codified or TY2025 state; **Rhode Island's TY2026 pair is
not published** and is expected in the November 2026 advisory, which as of 2026-09-04 has not issued.

---

## 2 · New Mexico — § 7-2-5.2, all three tables

Exemption is **$8,000 maximum per qualifying individual**, of "income includable except for this
exemption in net income." Claimable by any individual **65 or older** — and, separately, by any blind
individual at any age, which the model cannot express.

| MFJ / head of household / surviving spouse — AGI | exemption | Single — AGI | exemption |
|---|---|---|---|
| not over $30,000 | $8,000 | not over $18,000 | $8,000 |
| over $30,000, not over $33,000 | $7,000 | over $18,000, not over $19,500 | $7,000 |
| over $33,000, not over $36,000 | $6,000 | over $19,500, not over $21,000 | $6,000 |
| over $36,000, not over $39,000 | $5,000 | over $21,000, not over $22,500 | $5,000 |
| over $39,000, not over $42,000 | $4,000 | over $22,500, not over $24,000 | $4,000 |
| over $42,000, not over $45,000 | $3,000 | over $24,000, not over $25,500 | $3,000 |
| over $45,000, not over $48,000 | $2,000 | over $25,500, not over $27,000 | $2,000 |
| over $48,000, not over $51,000 | $1,000 | over $27,000, not over $28,500 | $1,000 |
| **over $51,000** | **$0** | **over $28,500** | **$0** |

*(MFS, not modelled: $8,000 not over $15,000, stepping $1,500, zero over $25,500.)*

**Base is explicitly AGI** — every table is headed "If adjusted gross income is:".
**History ends at Laws 1987, ch. 264, § 6.** Never indexed. Comparator is **inclusive** ("not over").

---

## 3 · Connecticut — TY2026 phase-out table, and the open item closed

From the **2026** Form CT-1040ES, Page 5. The pension/annuity exemption and the IRA deduction share
this one schedule, and the IRA phase-in is **complete at 100% for TY2026** (the worksheet's Line 2
reads "Enter 100% of the amount of IRA (other than a Roth IRA)").

| federal AGI — single / MFS / HoH | federal AGI — MFJ | factor |
|---|---|---|
| $0 – $74,999 | $0 – $99,999 | **1** |
| $75,000 – $77,499 | $100,000 – $104,999 | .85 |
| $77,500 – $79,999 | $105,000 – $109,999 | .70 |
| $80,000 – $82,499 | $110,000 – $114,999 | .55 |
| $82,500 – $84,999 | $115,000 – $119,999 | .40 |
| $85,000 – $87,499 | $120,000 – $124,999 | .25 |
| $87,500 – $89,999 | $125,000 – $129,999 | .10 |
| $90,000 – $94,999 | $130,000 – $139,999 | .05 |
| $95,000 – $99,999 | $140,000 – $149,999 | .025 |
| **$100,000 and up** | **$150,000 and up** | **0** |

### ⚠ OPEN ITEM CLOSED — the boundary at exactly $100,000 / $150,000

ROUND5 §7 left this open because the OLR rendering has a gap at those two points. **The DRS table
closes it: the top row reads "and up", and the eligibility sentence reads *less than* $100,000 /
$150,000.** At exactly the threshold the factor is **zero**, not 2.5%.

**Implementation consequence.** Connecticut's rows are naturally *strict less-than* against the next
row's floor, while New Mexico's, New Jersey's and Rhode Island's are *inclusive* ("not over", "not
more than"). Expressing every table one way silently misprices one of them at the boundary. See §7.

**There is no age gate at all** — Connecticut conditions on income alone, and `exclAge: 0` is the
existing Kentucky precedent for that.

---

## 4 · New Jersey — § 54A:6-10 tiers

Percentages are **of the payments** received as pension, annuity, disability or retirement benefits
— not of income. Age gate **62**, or disabled under the federal Social Security Act.

| NJ gross income | MFJ | single | MFS |
|---|---|---|---|
| not more than $100,000 | up to **$100,000** | up to **$75,000** | up to **$50,000** |
| over $100,000, not more than $125,000 | **50%** | **37.5%** | **25%** |
| over $125,000, not more than $150,000 | **25%** | **18.75%** | **12.5%** |
| over $150,000 | **none** | none | none |

**Not indexed** — every change came by amendment. Comparator **inclusive**.

**The dollar caps cannot bind in the percentage tiers**, because payments cannot exceed gross income
and gross income there cannot exceed $150,000: the largest possible MFJ figure is 50% × $150,000 =
$75,000, under the $100,000 cap. So the tiers are a pure percentage. A cap-then-percentage
implementation would still pass a tier-1 test — which is exactly why §5 of the scope demands a case
in *each* tier.

---

## 5 · Virginia — the taper, and the mechanic that would have been built wrong

**§ 58.1-322.03(5)(b):** $12,000 per individual born after 1 Jan 1939 who has attained 65, reduced
$1 for every $1 that **AFAGI** exceeds **$50,000 single / $75,000 married**. AFAGI is federal AGI
minus Title II Social Security and other benefits taxable solely under IRC § 86 — so for this model
it is exactly federal AGI minus taxable Social Security, with no approximation. Not indexed since
TY2004.

**The Form 760 Age Deduction Worksheet settles the once-vs-twice question**, and the statute alone
does not:

| worksheet line | what it does |
|---|---|
| 1 | count of taxpayers claiming an income-based age deduction |
| 8 | AFAGI — **combined for married taxpayers, regardless of filing status** |
| 9 | the limit: $50,000 single / $75,000 all married |
| 11 | if Line 8 > Line 9, **the excess — computed once** |
| 12 | Line 1 × $12,000 — the combined maximum |
| 14 | Line 12 − Line 11 |
| 15C | both spouses claiming → **divide by 2** |

So the reduction is **one subtraction against the combined maximum**, which is the scope's `taper`
shape exactly: `max(0, perPerson × qualifying − max(0, measure − threshold))`.

| | maximum | extinguished at AFAGI |
|---|---|---|
| single | $12,000 | **$62,000** |
| married, one spouse qualifying | $12,000 | **$87,000** |
| married, both qualifying | $24,000 | **$99,000** |

⚠ **A per-spouse taper is wrong by a factor of two through the whole phase-out range** and correct
everywhere else, so it passes a two-sided test. The §5 requirement for a both-spouses case in the
taper range is load-bearing, not belt-and-braces.

Also confirmed: the age deduction **cannot be combined with the Disability Income subtraction**, and
those born on or before 1 Jan 1939 get $12,000 with no income test — age 87+ in 2026, outside the
app's frame, and to be left unmodelled rather than mistaken for a gap.

---

## 6 · Rhode Island — the conflict re-confirmed, and the shipped note is now right

| source | TY2024 single | TY2025 single | TY2024 MFJ | TY2025 MFJ |
|---|---|---|---|---|
| **ADV 2025-22** (Nov 2025) | $104,200 | $107,000 | $130,250 | **$133,750** |
| **PUB 2026-01** (Feb 2026) | — | $107,000 | — | **$133,500** |

ADV 2025-22 is right; PUB 2026-01 carries a typo it repeats throughout. The TY2024 pair confirms the
mechanism — $104,200 ÷ $80,000 = $130,250 ÷ $100,000 = 1.3025 exactly — and $133,500 cannot be
produced by any single factor applied to both base amounts.

⚠ **New this session, not in ROUND5:** ADV 2025-22 gives **married filing separately** its own
column, $104,225 for TY2024 and **$107,000** for TY2025 — $25 above single in 2024 and equal to it in
2025, an artifact of rounding each figure down to a multiple of $50 independently. It does not affect
the model, which has no MFS status, but it belongs in the "unmodelled filing statuses" disclosure
rather than being assumed to track single.

**The shipped app note is correct.** An AST dump of `STATE_RULES.RI` at v5.63 reads
`$133,750 MFJ/$107,000 single, per ADV 2025-22` — the ROUND5 §8 defect is closed, verified from the
source rather than from the CHANGELOG.

**The cliff is all-or-nothing**: $1 over and the entire modification is lost. The exclusion is
**$50,000 per qualifying individual**, each capped at that individual's own qualifying income, and
**no IRA of any kind qualifies**. Comparator **inclusive** ("at or below").

---

## 7 · The two open items, and one new design point

### 7a · New Mexico's stepped table vs its graduated rate schedule — **CLOSED**

Carried unresolved from ROUND4 §3. The exemption reduces **net income**, so its cash value is the
taxpayer's **marginal rate**. Under § 7-2-7 effective 2025, MFJ:

| taxable income | rate |
|---|---|
| not over $8,000 | 1.5% |
| over $8,000, not over $25,000 | 3.2% |
| over $25,000, not over $50,000 | 4.3% |
| over $50,000, not over $100,000 | 4.7% |
| over $100,000, not over $315,000 | 4.9% |
| over $315,000 | 5.9% |

**The exemption exists only at AGI ≤ $51,000 (MFJ).** After the federal-conformed standard deduction
(~$31,500 MFJ), taxable income at the top of that range is roughly $19,500 — the **3.2%** bracket,
and lower below it. The model prices the exemption at a flat **4.9%**.

**So the answer is yes, it interacts, and the flat rate over-values the exemption by roughly 1.5× to
3× wherever the exemption is non-zero.** That residual is **optimistic** and must be disclosed. It
runs opposite to the headline correction, which is strongly conservative: the model currently grants
$8,000 per person at every income level, and the statute grants $0 above $51,000. No structural
change is needed — this is a disclosure, not a mechanism.

### 7b · Connecticut's band boundaries — **CLOSED**, see §3

### 7c · NEW — the comparator is not uniform across the five statutes — **DECIDED: B-2, approved 2026-09-04**

Four statutes are **inclusive** at the band top ("not over $30,000", "not more than $125,000", "at or
below"). Connecticut is **exclusive** ("less than $100,000", "$100,000 and up → 0"). For whole-dollar
income the two agree; they diverge on any fractional measure, and the model's measure is a sum of
floats, not a rounded return figure.

**Resolved as `SCOPE_INCOME_CONDITIONING.md` B-2, approved 2026-09-04: a table-level comparator on
the field — `cmp: 'lte'` by default, `'lt'` for Connecticut** — rather than rounding the measure or
picking one comparator for all five. It is one extra key, it makes every §5 boundary pin meaningful,
and the alternative silently misprices whichever state loses the coin-toss.

⚠ **The pin that matters is the one AT the threshold.** One-below and one-above pass with the
comparator inverted on every state; only the exact-threshold case discriminates `lte` from `lt`.

---

## 8 · What is still not established

- **Rhode Island's TY2026 thresholds** — not published; November 2026.
- **How often each threshold binds** for the households the app models. Unchanged: the scope's §6
  measurement still needs the income measure to exist first, which is why D-1 is the correct first
  build increment.
- **The nine of nineteen exclusion states still unchecked** — a different problem, out of scope.

## 9 · What the build session should do with this

*(All four build decisions this file raised were approved 2026-09-04 and are recorded in
`SCOPE_INCOME_CONDITIONING.md` §7b. This list matches them; the scope is the authority.)*

1. Build **D-1's measure, D-2's two bases and D-3's evaluator** inside `stateTaxAnnual`, named
   **`exclTest`** (B-4), carrying the per-table comparator (B-2), with the cross-engine parity
   invariant and **no state populated** (B-1 (a)) — additive, so no output changes, which is what D-6
   requires and what §6's measurement needs. The CHANGELOG must say plainly that this release is not
   visible to a user.
2. Run §6's binding-frequency measurement, which that release makes possible.
3. Then populate one state per release. **Connecticut first**: it is the only one of the five whose
   simplification runs *pessimistic*, and it is the largest single-state dollar error for a
   mainstream household.
4. Encode the tables above rather than re-deriving them, and cite this file's sources in
   `METHODOLOGY.md`. **Rhode Island populates on the dated TY2025 pair (B-3)**, with the tax year
   named in its note; the November 2026 advisory is then an ordinary constants refresh.

---

*Destination: **`docs/FINDINGS-v5_63-state-statutes.md` in the repo, and the knowledge pool**, with the manifest row given at the foot of `SCOPE_INCOME_CONDITIONING.md`. It is
the oracle the populate releases test against, so it should outlive this session in both places —
unlike a session handover, which should not. **It carries no unresolved decision**: §7c was raised
here, decided as B-2, and is recorded in the scope.*
