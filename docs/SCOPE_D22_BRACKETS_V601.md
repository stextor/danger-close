# SCOPE — D-22, option 3, batch 2 · the seventeen remaining progressive states on their own schedules (v6.01)

**FULFILLED — shipped as v6.01 (2026-10-09).** Repo-only. §7 is the build record. D-22 closes with it.

*(Superseded status line, retained:)* **READY — 2026-10-09.** Repo-only. Steve, 2026-10-09: "Let's do the next batch for D-22" — the seventeen rows v6.00's BR-13 left on one rate
(AL, AR, CT, DE, DC, HI, KS, ME, MD, MO, MT, NE, NM, ND, RI, VT, WV), read and modelled the way batch 1 was. Under his standing instruction
every decision below carries a recommendation the build takes and records. **Stop only where §5's conditions fire.** A MODELLING release:
METHODOLOGY changes. With it, every progressive row is on its own schedule and D-22 closes.

## 0 · Premise (verified against v6.00, not assumed)

Freshness (OPERATIONS §A): repo `c00822f` (source commit `b800ca1`), full clone; source `d535e13e865e9592e41f93f4359328f0` = repo = pool
(verified 2026-10-09 at the v6.00 check: the two large pooled files by hash, the 63 others by content, the pool listing name-exact; every
packaged `knowledge/` file matches a committed file by content) = CHANGELOG newest; v6.00 rebuilt byte-identical first: built
`3e02a42fac6f6281d7c0b17ab77cdcbd`. Pool 128.

**The model, read by AST.** v6.00's `stateTaxAnnual` taxes a row carrying `brackets` on its schedule and every other row `rate × base`
(v6.00 BR-1). The seventeen rows carry one rate each: a top rate (KS 5.58 %, MO 4.7 %, MT 5.65 %), a rate below the top (AL 4.5 %, CT 5 %,
DC 6.5 %, DE 5.5 %, HI 6.75 %, MD 7.5 % "state+county", ND 2 %, NE 5.2 %, NM 4.9 %, RI 5 %, VT 6.6 %, ME 7.15 %), or a stale one (AR 3.9 %,
WV 4.82 %). Readers of `rate` are unchanged from v6.00's census (§2).

**The law, read at primary sources on 2026-10-09** (a research pass, then each schedule re-read by me at its source):

| State | Schedule (TY2026 unless stated) | Source |
|---|---|---|
| AL | 2 / 4 / 5 %; single to $500 / $3,000, joint $1,000 / $6,000 | Code of Ala. §40-18-5 (unchanged since 1998); ALDOR withholding booklet Jan 2026 |
| AR | 0 % to $5,599, 2 % to $11,199, 3 % to $15,999, 3.4 % to $26,399, 3.7 % to $94,700; above $94,700 ALL net income at 2 % on $4,700 + 3.7 %, less a bracket adjustment $290 → $10 in $100 bands to $97,600; one table for every status | Act 1 of the 2026 First Extraordinary Session (HB1001), A.C.A. §26-51-201(a)(4)(A)–(C), retroactive to 1 Jan 2026; DFA 2026 withholding formula |
| CT | 2 / 4.5 / 5.5 / 6 / 6.5 / 6.9 / 6.99 %; single $10k / $50k / $100k / $200k / $250k / $500k, joint double; + the 2 % bracket's phase-out ($25 / $50 per $5,000 "or fraction thereof" over $56,500 / $100,500, max $250 / $500) and three recapture tiers (single $25 per $5k over $105k max $250; $90 per $5k over $200k max $2,700; $50 per $5k over $500k max $450 — joint $50 / $180 / $100 per $10k over $210k / $400k / $1M, max $500 / $5,400 / $900), all on Connecticut AGI | C.G.S. §12-700(a)(10) (A)(ii)–(v), (C)(ii)–(v); DRS CT-1040 TCS 2025 Tables B–D (statute unchanged for 2026) |
| DE | 0 % to $2,000, 2.2 / 3.9 / 4.8 / 5.2 / 5.55 / 6.6 % to $5k / $10k / $20k / $25k / $60k / above; one schedule | 30 Del. C. §1102(a)(14) (since 2014; no (a)(15)) |
| DC | 4 / 6 / 6.5 / 8.5 / 9.25 / 9.75 / 10.75 %; $10k / $40k / $60k / $250k / $500k / $1M; one schedule | D.C. Code §47-1806.03(a)(11); OTR rates page |
| HI | 1.4 % … 11 %, twelve rows each (single to $9,600 … $325,000; joint double) — the 2025–26 schedule | HRS §235-51 as amended by Act 46 (2024); **Act 24 of 2026** (SB 3125, approved 21 May 2026) replaces the 2027 and 2029 schedules: lower rates in the bottom brackets and a **13 % bracket above $500,000 single / $1,000,000 joint**, "taxable years beginning after December 31, 2026" |
| KS | 5.2 / 5.58 %; single to $23,000, joint $46,000 | K.S.A. 79-32,110(a) (L. 2024 Sp. Sess. ch. 1); KDOR Notice 25-06: "no rate reduction for tax year 2026" |
| ME | 5.8 / 6.75 / 7.15 %; single to $27,400 / $64,850, joint $54,850 / $129,750; + 2 % surcharge on Maine taxable income over $1,000,000 single / $1,500,000 joint from 2026 | MRS 2026 schedule (revised 20 May 2026); 36 M.R.S. §5111(7) (PL 2025 c. 650 Pt. DDDD) |
| MD | 2 / 3 / 4 / 4.75 / 5 / 5.25 / 5.5 / 5.75 / 6.25 / 6.5 %; single to $1k / $2k / $3k / $100k / $125k / $150k / $250k / $500k / $1M; joint $1k / $2k / $3k / $150k / $175k / $225k / $300k / $600k / $1.2M; + county tax on Maryland taxable income 2.25 %–3.30 % (3.30 %: Dorchester, Kent); + 2 % of net capital gain when federal AGI exceeds $350,000 (from TY2025) | Tax-Gen. §10-105 (BRFA 2025, ch. 604), §10-106; DLS "2026 County Local Tax Rates" |
| MO | 0 % to $1,348, then 2 / 2.5 / 3 / 3.5 / 4 / 4.5 % in $1,348 bands, 4.7 % above $9,436; one chart (each spouse charted separately on a joint return) | RSMo 143.011 (indexed); DOR 2026 withholding formula (the 2026 MO-1040 chart is unpublished) |
| MT | 4.7 / 5.65 %; single to $47,500, joint $95,000 (2027: 5.4 % above $65,000 / $130,000) | MCA 15-30-2103 (temporary version through 2026), HB 337 (2025) |
| NE | 2.46 / 3.51 / 4.55 / 4.55 %; single to $4,130 / $24,760 / $39,900, joint $8,250 / $49,530 / $79,800 (2027: 3.99 % top) | Neb. Rev. Stat. §77-2715.03 (LB 754, 2023); DOR 2026 schedule, **DRAFT dated 17 Aug 2026** |
| NM | 1.5 / 3.2 / 4.3 / 4.7 / 4.9 / 5.9 %; single to $5,500 / $16,500 / $33,500 / $66,500 / $210,000, joint $8k / $25k / $50k / $100k / $315k | NMSA §7-2-7 as amended by Laws 2024 ch. 67 (HB 252 of 2024), from TY2025 |
| ND | 0 / 1.95 / 2.5 %; single to $49,575 / $250,400, joint $82,800 / $304,850 | N.D.C.C. §57-38-30.3 (indexed); Form ND-1ES 2026 |
| RI | 3.75 / 4.75 / 5.99 %; to $82,050 / $186,450; one schedule — and from 2027 a surtax on income over $1,000,000: 1 % 2027, 2 % 2028, 3 % 2029 on | R.I.G.L. §44-30-2.6; ADV 2025-22 (TY2026); FY2027 budget H 7127 Sub A Art. 6 §5 (Division's 2026 summary of legislative changes) |
| VT | 3.35 / 6.6 / 7.6 / 8.75 %; single to $50,750 / $122,850 / $256,300, joint $84,700 / $204,750 / $312,050 | 32 V.S.A. §5822; IN-114 2026 "2026 Preliminary Vermont Tax Rates" |
| WV | 2.11 / 2.81 / 3.16 / 4.22 / 4.58 %; $10k / $25k / $40k / $60k; one schedule for single and joint | W. Va. Code §11-21-4j (SB 392 of 2026, retroactive to 1 Jan 2026) |

Findings from the reading that bear on the design:
- **Arkansas** cut its top rate to 3.7 % for 2026 (Act 1, May 2026); the 3.9 % row was a year stale. Above $94,700 the law taxes ALL net
  income on a second table — 3.7 % × NI − $79.90 — and softens the step with a bracket adjustment ($290 at $94,701–$94,800, $10 less each
  $100, none from $97,601). The table and the DFA formula agree to the cent at every edge (checked).
- **Connecticut's** phase-out and recapture are additions of whole dollars per $5,000 (or $10,000) "or fraction thereof" of Connecticut AGI
  — so one dollar over $56,500 adds a full $25. Connecticut AGI is after the pension and Social Security subtractions, which is the model's
  state base; the personal exemption is subtracted after it.
- **Hawaii's Act 24 of 2026** and **Rhode Island's FY2027 budget** have already enacted top brackets for later years (HI 13 % from 2027;
  RI's surtax to 3 % from 2029) that a schedule held at 2026 would miss — the optimistic direction for the households they reach. At every
  income the 2026 schedule with the later top bracket added is at or above every schedule those acts enact for 2027–2029 (checked by `t65`
  A-12 on a grid to $3M), so it is a conservative stand-in for every model year.
- **Maine's** 2 % surcharge (new for 2026) is a fourth bracket above $1,000,000 / $1,500,000. Maine has no benefit recapture.
- **Maryland's** row was "state + county effective". The county tax is levied on Maryland taxable income — the same base — at 2.25 %–3.30 %.
  The 2 % capital-gains tax is new from 2025 and keyed to FEDERAL AGI over $350,000; it applies to the whole net capital gain.
- **Missouri** exempts capital gains entirely from TY2025 (HB 594 & 508, RSMo 143.121). The model taxes them (conservative) — an
  exclusion, not a bracket, so out of this release (§4) and logged as **D-29**.
- **Vermont's** minimum tax (3 % of federal AGI over $150,000, §5822(a)(6)) cannot bind in the model: no deduction or exclusion is taken
  there that could bring the schedule's tax under 3 % of AGI (checked by `t65` A-13).
- **North Dakota's** 0 % band is wide ($49,575 / $82,800) — the 2 % row taxed it all.
- **Delaware's** Department of Finance tax-preference report prints two bases 50 cents above the statute's own arithmetic ($261.50, $741.50);
  the statute's rates and thresholds govern, and the model is their bracket sum.
- **Printed bases are rounded** in Hawaii's statute, Maine's schedule and Vermont's preliminary rates (whole dollars, under $1 from the sum).
- **No state standard deduction, personal exemption or credit** is modelled anywhere (v6.00 BR-3), nor Alabama's deduction of federal income
  tax, which is large; leaving them out overstates tax.

**Measured** (scratch probe `/home/claude/m601/m601.mjs`, v6.00 against the staged v6.01; not shipped):
- **Engine B** (Taxes tab, example household — Georgia's household moved to each state — lifetime state tax, Roth $0 / $70,000 a year): only
  the seventeen rows move; the other 35 jurisdictions (with "none") are byte-identical. AL $71,301 → $77,583 · AR $61,794 → $50,830 ·
  CT $75,553 → $70,199 · DE $72,014 → $66,614 · DC $118,200 → $118,735 · HI $122,746 → $97,191 · KS $101,470 → $98,216 · ME $78,212 →
  $70,129 · MD $101,478 → $107,711 · MO $85,468 → $80,952 · MT $133,967 → $119,556 · NE $94,560 → $71,599 · NM $103,949 → $87,978 ·
  ND $36,369 → $9,526 · RI $107,214 → $85,823 · VT $159,468 → $114,827 · WV $85,801 → $62,920 (Roth $0). Rises: AL (4.5 % → 5 % on
  nearly all income), DC (the 8.5 % bracket), MD (the explicit 3.30 % county rate over 4.75 %).
- **Engine A** (Roth comparator, three households): strategy tax moves both ways (example 29 up / 73 down; H1 35 / 67; H2 29 / 73).
  **The estate-best strategy changes in four cells**: H1 RI fill12 → fill22; H2 AR, DE and VT fill22 → irmaa1. Expected, as at v6.00: a
  conversion's state cost now depends on the bracket it fills. Reported, not a stop condition (§5).
- Engines C and D compute no state tax.

**Direction:** mixed, by design. Most households pay less (the one rates overstated the low brackets); AL, DC and MD pay more, and at high
incomes HI (13 %), RI (8.99 %), ME (9.15 %), NM (5.9 %) and CT (its recapture) rise.

## 1 · Decisions (taken on recommendation; §7 records each)

- **BR2-1 — the same field.** Each of the seventeen carries `brackets: { single, joint }` (v6.00 BR-1), `rate` = the top rate (v6.00 BR-2),
  `years.brackets: 2026`. One schedule for every status where the law has one (AR, DE, DC, MO, RI, WV), held in both keys.
- **BR2-2 — Arkansas's high-income table is modelled exactly**, as a new field `upper: { over: 94700, brackets: [[4700, .02], [null, .037]],
  adjust: { to: 97600, width: 100, first: 290, step: 10 } }`: above `over` the calculator taxes the whole base on `upper.brackets` and subtracts
  the adjustment band's amount. *Alternative:* omit the adjustment — rejected: it is exact law, cheap, and omitting it puts a $287 cliff in a
  stress-tester's Roth comparator. *Alternative:* run the low table at every income — rejected: optimistic by $287 a year above $94,700.
- **BR2-3 — Connecticut's phase-out and recapture are modelled exactly**, as `stepAdds: { single, joint }` rows `[over, per, each, max]`,
  "or fraction thereof" as a ceiling, measured on the model's state base (Connecticut AGI). *Alternative:* omit them — rejected: optimistic
  by up to $3,400 single / $6,800 joint a year.
- **BR2-4 — Maryland's county tax at the highest county rate, 3.30 %**, as `local: 0.033` on the same base; `rate` = 6.5 % + 3.3 % = 9.8 %
  (t64 A-5 now reads "top + local"). *Alternative:* 3.20 %, the rate most Marylanders pay (Baltimore City, Montgomery, Prince George's,
  Howard…) — rejected by the design default (make the plan look slightly worse when one figure must stand for many), disclosed: the model
  overstates by 0.10 %–1.05 % of the base for every county below 3.30 %. A county picker is out of scope (§4).
- **BR2-5 — Maryland's 2 % capital-gains tax is modelled**, as `cgSurtax: { rate: 0.02, agiOver: 350000 }`, on the whole `capGains` when
  the calculator's existing federal-AGI measure (`_stateIncome("agi")`, the one Connecticut's and New Mexico's tests use) exceeds $350,000.
  Its exclusions (a primary residence sold under $1.5M, retirement-plan assets, farm and conservation property) are not modelled (conservative).
  *Alternative:* omit it — rejected: optimistic for exactly the households it reaches.
- **BR2-6 — Maine's surcharge is a fourth bracket** (9.15 % above $1,000,000 / $1,500,000). The law indexes the thresholds from 2027; holding
  them is conservative.
- **BR2-7 — enacted later top brackets are applied in every year (Hawaii, Rhode Island).** HI: the 2026 schedule plus Act 24's 13 % above
  $500,000 / $1,000,000. RI: the 2026 schedule plus the surtax at its 2029+ 3 % above $1,000,000 (both statuses; the law indexes it, held).
  Each overstates the years before the bracket starts; at every income it is at or above every enacted later schedule (§0, `t65` A-12).
  *Alternative:* hold 2026 alone (v6.00 BR-4's rule) — rejected: from 2027 it would understate tax for the households above the new lines.
  *Alternative:* year-varying schedules — rejected for now: the module has no year dimension, and adding one is its own release.
- **BR2-8 — later lower schedules are not applied (MT 2027, NE 2027, KS/MO/WV triggered cuts).** Holding 2026 is conservative (BR-4); the
  notes name each.
- **BR2-9 — one schedule on the couple's combined income** where the law lets spouses compute separately (AR's status 4, DE's combined-separate
  return, MO's per-spouse charting). Conservative (MO: at most $180.63 a year; AR and DE: up to the value of a second set of low brackets);
  disclosed in each note.
- **BR2-10 — Missouri's 2025 capital-gains subtraction is not modelled here** — it is an exclusion (§4). Disclosed in the note and logged as
  D-29 (recommended soon: it is large and simple).
- **BR2-11 — the display.** My Data's model line reads the schedule's own last rate (not `rate`), so Maryland reads "the state's own
  brackets, 2.00% to 6.50%, plus a 3.30% county tax"; every other bracket row reads as at v6.00. The AI context's state line adds " plus a
  3.3% county tax" for Maryland. Flat-rate rows keep "X% effective rate (an approximation)" (unchanged; a "flat rate" label is a separate
  presentation item, §4).
- **BR2-12 — the Field Manual.** The Taxes entry's list becomes every progressive state (27, held to the set of rows carrying a schedule by
  `t65` E-6) with the added rules named; its "for the other progressive states one rate stands in for the brackets" clause is removed (no such
  state remains); the methodology entry's sentence follows; "skips county/city taxes" gains "except Maryland's county tax, taken at the highest
  county rate". The STATE_RULES header comment's "`rate` is an effective flat approximation" is rewritten.
- **BR2-13 — dated figures.** `years.brackets: 2026` on all seventeen (Vermont's 2026 rates are the Department's "preliminary" table and
  Nebraska's a draft, both computed by statute from published indexes; each note says so). Six rows gain their first dated figure (DC, HI,
  KS, MO, ND, NE): the `t51` census becomes 33 rows / 59 figures.
- **BR2-14 — derived pins (v6.00 BR-16, unchanged).** Hand figures elsewhere that price one of the seventeen at its old rate keep their BASE
  and, on the v6.01 leg, expect it on the state's schedule, computed in the suite independently of the app; labels say so. Where a suite
  recovered an exclusion by dividing a tax by a rate (`t35` §C, `t54` §X) it inverts the schedule instead (bisection; each is strictly
  increasing).
- **BR2-15 — the parity guardrail.** `t2`'s `stateTax` fingerprint is a Georgia call; Georgia is flat and untouched, so no key may move.
- **BR2-16 — the version is v6.01, tag `v601`** (free: vercensus 0 sites, the three `.py` lists, no `dom_entry_v601.jsx` in history).

## 2 · Site census (AST)

**Source** (`stage_v601.py`, 48 anchors, each counted once on v6.00): the seventeen rows (schedule, top rate, `years.brackets`, Arkansas's
`upper`, Connecticut's `stepAdds`, Maryland's `local` and `cgSurtax`) and their notes (seventeen); the module header comment (two); the
calculator (two sites: after the schedule sum, and before the return); My Data's model line; the AI context line; four Field Manual
sentences; four version sites. `rate`'s other readers (the zero-tax test, Utah's credit, the wizard, the picker) are unchanged (BR-2); for
Maryland they now read 9.8 %, the top marginal rate including the county.

**Suite:** derived pins are found by running the full suite on the staged build and gated per BR2-14 (sites counted by AST): `t10` (42: AL, DE, MD, ME, MT,
NM, RI), `t35` (CT §B 14, §C by inversion; RI-4), `t39` (14: ME, MT), `t50` (14: CT, NM, RI, VT), `t51` (census, six Maine cases, the display), `t52` (AR), `t54` (11 + §X by inversion: WV, MD, ME),
`t58` (RI), `t59` (RI, WV), `t60` (ME), `t61` (the rate-claim set), `t64` (A-1, A-5, D, E-1, E-5, E-6, E-8 — v6.00's suite on a v6.01 leg).

## 3 · Tests

New suite **`t65_state_brackets_b2.mjs`**, both legs (the v6.00 leg pins the one rates and the absence of schedules):
- **A** — the seventeen schedules equal §0's sources, dated 2026, with their top rates; Arkansas's `upper`, Connecticut's `stepAdds`,
  Maryland's `local` and `cgSurtax` exactly; EXTINCTION: only those rows carry those fields; **D-22 EXTINCTION — every taxing row is on a
  schedule or is one of the fifteen flat-rate states**; every note states its top rate for its year, says "own brackets" and "not taken
  (conservative)", and names its own simplification; the claims about later schedules (A-12) and Vermont's minimum tax (A-13) held to the code.
- **B** — each schedule against the state's PRINTED bases: CT, DC, KS, NM, ND, NE, RI, WV and Arkansas's DFA subtraction constants to the cent;
  HI, ME, VT within $1 (whole-dollar bases); Arkansas's high table against the DFA formula above $97,600 and inside the adjustment band.
- **C** — 46 hand cases to the cent through `stateTaxAnnual`, each computed independently in Decimal from the printed tables (session working
  `hand601.py`; figures in §7): every state; Arkansas at $94,700 / $94,750 / $95,050 / $97,600 / $97,601; Connecticut at $56,500 and $56,501,
  every add at its maximum, and an exempt pension under the add-back measure; Maryland's county tax, its capital-gains test at exactly $350,000
  and where federal AGI crosses the line while the state base does not; Maine's surcharge and its offset-and-phaseout household; Hawaii's
  and Rhode Island's top brackets; a survivor on Kansas's single schedule; Georgia unchanged.
- **D** — (v6.01 leg, needs `app_v600.mjs`) every jurisdiction × 192 households: byte-identical outside the seventeen; inside, equal to an
  independent implementation (schedule, Arkansas's table, Connecticut's adds, Maryland's county and gains tax) on v6.00's base.
- **E** — My Data's line for Maryland, Hawaii, North Dakota, and Georgia unchanged; the AI context line's county clause; the Field Manual's
  four sentences, each with its code fact.
- Controls `qa/tools/controls_v601_brackets.py` (repo-only), §3.1.

### 3.1 · Controls (each mutation must turn the named check red)

K1 a Hawaii threshold moved · K2 Maryland's county tax removed · K3 Arkansas's adjustment removed · K4 the calculator ignores Connecticut's
adds · K5 the calculator ignores Arkansas's high table · K6 Maryland's gains test on the state base instead of federal AGI · K7 Connecticut's
"or fraction thereof" dropped · K8 Georgia moves (and `t2` parity must fire) · K9 the methodology sentence reverted · K10 My Data's county
clause removed · K11 Hawaii's 13 % removed · K12 Rhode Island's surtax removed · K0 unmutated.

## 4 · Out of scope

State standard deductions, exemptions and credits, and Alabama's deduction of federal income tax (v6.00 BR-3; logged as **D-30**, the
recommended next release);
Missouri's capital-gains subtraction (D-29) and every other exclusion change; Hawaii's 7.25 % capital-gains cap, Montana's 3 % / 4.1 %
capital-gains rates, North Dakota's 40 % and New Mexico's $2,500 capital-gains deductions, Vermont's capital-gains exclusion (all conservative
to omit); year-varying schedules (BR2-7); a Maryland county picker (BR2-4); per-spouse computation (BR2-9); NYC, Indiana county, Michigan and
Ohio city taxes; a "flat rate" label for the flat-rate rows (BR2-11); Massachusetts's 4 % surtax (unchanged, disclosed in its note).

## 5 · Stop conditions

Stop and report if: a primary source contradicts §0; anything outside the seventeen rows moves (`t65` D, MC parity); a schedule fails its
printed table beyond the stated tolerance; a suite asserts an old single rate on purpose in a way BR2-14 cannot gate honestly; the D-22
extinction (`t65` A-7) finds a taxing row that is neither on a schedule nor flat in law.

## 7 · Build record (v6.01, 2026-10-09)

- **Source** `b7eb4dcb32795a35c5026953a5a31b68` (48 anchors, each once on v6.00: seventeen rows, seventeen notes, two header-comment lines, the calculator's two sites, My Data's
  line, the AI context line, four Field Manual sentences, four version sites). **Built** `55cae3ab526d114eaaa89a6d890d8a8e` (v6.00 rebuilt byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — outside the seventeen the calculator is byte-identical (`t65` D-1) and MC parity is 10/10 with no declaration; every
  schedule reproduces its printed bases within the stated tolerance (`t65` B); the D-22 extinction holds (`t65` A-7); no source contradicted §0.
- **`t65`** 103 (v6.01) / 54 (v6.00). **Controls 13 of 13.**
- **Corrections found by the run, owned here:**
  - Montana's first note named no "not taken (conservative)" deduction (`t65` A-9 failed on it): Montana starts from federal taxable income, so the
    federal standard deduction is the one not taken. The note was corrected and the source restaged.
  - `t64`'s group D failed on the v6.00 leg of a v6.00 → v6.01 folder: it needs `app_v599.mjs`, which only a v5.99 → v6.00 folder holds. It now reports
    itself not run there (t63 C's convention) rather than failing.
  - `t60`'s first gating edit opened a template literal in a label and closed it with a quote; the suite died on load and the quote was corrected.
  - `t51`'s My Data selector matched only "effective rate", so Maine's and Rhode Island's new lines read empty; it now also matches "own brackets" on bracket legs.
  - The first cut of this package explained `t64`'s 65 → 62 as three gated checks plus group D; it is two (E-6, E-8) plus group D. Caught on
    reading the generated CHANGELOG; the documents were restored and the whole package regenerated, as §L requires.
  - The first measurement probe ran the two builds the wrong way round (a sed edit swapped the imports); every figure was re-measured the right way before
    any was recorded.
- **Sources** re-read in the session after a research pass: Code of Ala. §40-18-5; Act 1 of the 2026 First Extraordinary Session (all three tables);
  C.G.S. §12-700(a)(10) (the phase-out and recapture text) and the DRS CT-1040 TCS 2025 Tables B–C; 30 Del. C. §1102(a)(14); D.C. Code §47-1806.03(a)(11);
  HRS §235-51 (2025–26 and Act 46's 2027 tables) and Act 24 of 2026 (GM1124, the 2027 and 2029 tables and §9's dates); K.S.A. 79-32,110 and KDOR Notice
  25-06; Maine's revised 2026 schedule and §5111(7); Tax-Gen. §10-105 and the DLS 2026 county table; Missouri's 2026 withholding formula; MCA 15-30-2103
  (both versions); Nebraska's 2026 draft schedule; 2024 HB 252 (§7-2-7 tables); Form ND-1ES 2026; RI ADV 2025-22 (incl. that its modification thresholds
  are TY2025, as the row says) and the Division's 2026 summary of legislative changes (the surtax); VT IN-114 2026 ("2026 Preliminary"); W. Va. Code §11-21-4j.
- **Suite:** 5,579 app checks, 64 suites, 0 failed, 0 DIED; GRAND 5,709. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v600 v601 from a full clone of c00822f with the github/ files overlaid (v6.00 resolved from history, commit b800ca1), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5487, half B GRAND 222; none DIED.
