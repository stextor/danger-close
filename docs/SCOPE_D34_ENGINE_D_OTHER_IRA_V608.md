# SCOPE — v6.08 · D-34: Engine D converts an Other-accounts Traditional IRA, and carries it correctly

**FULFILLED — shipped as v6.08 (2026-10-12).** Repo-only. §7 is the build record. D-34 closes; D-35 opens.

*(Superseded status line, retained:)* **DRAFT — 2026-10-12, awaiting Steve's decisions (§5).** Repo-only. A MODELLING release (METHODOLOGY changes).
Steve, 2026-10-12: *"Let's do D-34"*.

## 0 · Premise (verified at v6.07, not assumed)

**Freshness (OPERATIONS §A).** Fresh clone of `origin/main` at `e01db32` (the ops package of 2026-10-12 on top of v6.07). Source
`ee557028aba1dfb1acb5bb647f6c5630` = repo = the pooled `DangerClose-v6_07.jsx` (hashed after `project_read` at the v6.07 ship; not re-uploaded
since — Projects listing, 2026-10-12) = CHANGELOG newest app release. Built `5b444023ed72ebca40c9d0443b2ddf05` = live Pages (curl, today).
Suite files: the ops package's post-upload check this afternoon compared all 13 changed files to the clone and ran `package_check` from the
clone against a pool listing identical by name to the live one (127): 50 passed, 0 failed.

### 0.1 · The law (primary sources, read 2026-10-12)

- **An RMD cannot be converted, and the year's first dollars are the RMD.** Treas. Reg. §1.408A-4, Q&A-6(a): *"In order to be eligible for a
  conversion, an amount first must be eligible to be rolled over. Section 408(d)(3) prohibits the rollover of a required minimum distribution.
  … the first dollars distributed during that year are treated as consisting of the required minimum distribution …"*
- **A converted amount is income in the year converted.** §1.408A-4, Q&A-7(a): *"Any amount that is converted to a Roth IRA is includible in
  gross income as a distribution …"*
- **An IRA's RMD is figured on its actual prior-year-end balance.** Treas. Reg. §1.408-8(b)(2): the account balance *"of the IRA as of December 31
  of the calendar year preceding"* the distribution year (and §1.401(a)(9)-5(b)(1) for plans). So the balance the RMD is figured on includes the
  account's growth.
- **No rule orders conversions between accounts.** Which account a person converts from is their choice; the model has to pick one, and says so.
  (A non-qualified annuity is never convertible — D-33, §408A(c)(5)(A)/(e)(1), already verified at v6.07.)

### 0.2 · What Engine D does (parser census, `qa/tools/census.cjs` and `funcmap.cjs` on `src/DangerClose.jsx`)

Engine D is `computeWithdrawalPlan` (L5456–5912), the Withdrawal tab. Through `withdrawalPlanSeries` (L5956) its spending-draw series feeds
**Engine A** (the Roth tab's strategy comparison, L6485 · L10558 · L10705 · L11868), **Engine B** (the Taxes tab, L10799) and **Engine C** (the
IRMAA tab, L11090). A Traditional IRA the user enters under *Other accounts* lives in Engine D's **Priority-1 pool** (`taxable`, since v5.26),
tracked by `taxOrd` (ordinary money) and `taxRmdA` / `taxRmdB` (the RMD-bearing part; annuities excluded).

Three defects, all in how Engine D handles that IRA. The first is D-34 as filed; the census found the other two in the inputs the fix reads.

**(1) The conversion — D-34 as filed, confirmed, and a third term.** L5645:
`conv_y = yr <= _ladderEnd ? Math.min(rothAmount, Math.max(0, tradNotional_boy - rmd_y)) : 0`
- `tradNotional_boy` is the buckets' pre-tax money only; `rmd_y` includes the Other-account IRA's RMD (L5641). The cap subtracts an RMD
  that never left the buckets.
- The Other-account IRA is **never converted**. Engines B and C convert it (their cap is the non-annuity balance: C at L5352, B at L6166).
- **New in the census:** the cap ignores the year's spending draw from the buckets, which is taken before the year ends. When the slider
  outruns the buckets, the conversion is charged on money already spent. The `Math.max(0, …)` floor at L5804 then hides it.
  Measured: one year at each high slider on the example household (below).

**(2) The IRA's RMD tracker never grows — not on record anywhere.** `taxRmdA` has exactly three sites: init L5557, read L5637/L5671, and the
pro-rata shrink L5767. `taxRmdB` matches. **There is no growth site.** The pool grows (L5831), and so does `taxOrd` (L5841, fixed at v5.37
as E-15b). The RMD-bearing tracker does not. So an IRA under Other accounts has its RMD figured on its opening balance less withdrawals,
never on its actual balance. That is the optimistic direction. The same shrink also takes the sleeve's own RMD out of the tracker
**pro rata across the whole pool** (L5766, `_rmdShrink = drawFromTaxable / _taxBoy`). It should leave the IRA it was figured on, as identified
dollars: that is how `taxOrd` already treats it (L5765), under v5.36's "one convention" rule. The conversion fix needs this tracker as its cap.

**(3) A Roth IRA under Other accounts — a separate finding, proposed as D-35 (§4).** It is counted twice in Engine D:
- once in the pool as gains-bearing brokerage (`_gainPoolInit` L5513 subtracts ordinary and HSA money, not Roth);
- once in the buckets' Roth fraction, because `rothFrac = _rothInit / _t401kInit` (L5580) and `_rothInit` includes Other-account Roth
  (`retireStartBalances`, L2349-2351).

Measured on the example household plus $200,000 of Roth IRA under Other accounts, against the same $200,000 entered as brokerage:
- capital gain: identical, $29,227 both ways;
- the buckets' Traditional balance in the first year: $1,048,850 against $1,179,744;
- lifetime RMD: $343,192 against $470,488.

Not built here unless Steve chooses otherwise (DD-3).

### 0.3 · Measured (session-only prototype of every recommended option, §1; `computeWithdrawalPlan`, B, C and A at module level)

Fixtures (each built the way My Data derives `household`, `total401k` and `bucketActuals`):
- **EXAMPLE** — the example household, with $104,000 of Other-account Traditional IRA.
- **NAMED_IRA** — $150,000 of holdings, a $900,000 rollover IRA under Other accounts, and $300,000 cash.
- **MIXED** — holdings scaled to 20 %; IRAs of $700,000 (A) and $200,000 (B); a $100,000 annuity (B); $40,000 cash.

| household | slider | Withdrawal tab: converted | lifetime RMD | lifetime MAGI | Taxes tab: lifetime tax | IRMAA tab | Roth tab: model's best cell (estate) |
|---|---|---|---|---|---|---|---|
| EXAMPLE | $0 | 0 | 1,021,349 | 2,907,370 | 212,907 | 0 | Fill 12 % 4,540,075 |
| EXAMPLE | $70K | 840,000 | 340,470 | 3,088,723 | 215,219 | 0 | Fill 12 % 4,551,543 |
| EXAMPLE | $200K | 1,305,857 → **1,303,185** | 0 | 2,989,796 → **2,987,124** | 280,011 | 11,500 | Fill 12 % 4,609,685 |
| NAMED_IRA | $0 | 0 | 430,216 → **653,901** | 2,592,924 → **2,628,635** | 144,301 → **132,864** | 0 | Fill 12 % 3,511,102 → **3,534,781** |
| NAMED_IRA | $70K | 50,000 → **840,000** | 359,010 → **31,160** | 2,631,042 → **2,757,927** | 157,906 → **143,437** | 0 | Your slider 3,507,958 → **Fill 12 % 3,579,978** |
| NAMED_IRA | $200K | 50,000 → **899,192** | 359,010 → **0** | 2,631,042 → **2,636,220** | 204,145 → **189,600** | 9,200 | Fill 12 % 3,504,199 → **3,624,244** |
| MIXED | $0 | 0 | 576,672 → **792,387** | 2,726,424 → **2,796,671** | 171,559 → **161,009** | 0 | Fill 12 % 3,326,791 → **3,348,193** |
| MIXED | $70K | 247,783 → **840,000** | 283,128 → **99,706** | 2,966,545 → **3,037,606** | 193,967 → **173,733** | 0 | Fill 12 % 3,287,186 → **3,347,542** |
| MIXED | $200K | 238,302 → **1,064,695** | 283,128 → **0** | 2,957,064 → **2,882,934** | 254,233 → **229,395** | 11,500 | Fill 12 % 3,287,186 → **3,427,114** |

**What the table says.**

- **The example household does not move** at $0 or $70,000. Engines D, B and C were compared field by field and are bit-identical; so are
  the Roth tab's strategies. Its Other-account IRA is spent as Priority-1 money long before RMD age, and at $70,000 the buckets never run out.
- **At sliders of $150,000 and above,** one year's Withdrawal-tab conversion falls by the money already spent that year:
  - $150K: 2037, $120,516 → $117,336;
  - $200K: 2035, $105,857 → $103,185;
  - $400K: 2032, $78,884 → $77,398.

  The Taxes, IRMAA and Roth tabs do not move, because Engine D's conversion is not part of the series they read.
  The single-filer and no-Other-IRA variants behave the same way.
- **Households holding Traditional money under Other accounts, on the Withdrawal tab:** the IRA now converts, and its RMD is figured on
  a balance that grows. Lifetime RMD and MAGI rise at $0 (the conservative direction). With conversions, the RMD falls because the IRA
  is converted first.
- **The same households on the Taxes tab:** lifetime tax falls by $10,500 to $25,000. This is a correction, not a loosening.
  - **Mechanism:** Engines B and C already converted this IRA themselves. The spending draw that Engine D handed them still treated the IRA
    as ordinary money, so they taxed some dollars twice.
  - **Measured on NAMED_IRA at $70,000 (v6.07):** in 12 years Engine B's Traditional balance is $0 at the start of the year, yet it still
    charges an imported ordinary draw, $137,056 in total. That is Traditional money it had already converted. In the prototype the count is 0 (also on MIXED, at both legs).
  - **At $0** the same correction comes through the RMD: a bigger Engine D RMD covers more of the spending, so less spending draw is handed
    over, while Engine B keeps its own RMD on the same IRA.
- **The Monte Carlo does not read Engine D** and cannot move.

**The alternative ordering (DD-1 (b), pro rata), also prototyped:** the example household moves at the default slider. Taxes tab −$132; the
Roth tab's estates +$1,800 to +$3,000. The named-IRA households land within a few hundred dollars of the recommended option.

## 1 · The change (recommended options; prototype built and measured, §0.3)

1. **The conversion is figured after the year's draws** (it was figured before them). The cap now counts only what is actually there.
   - **Buckets:** the pre-tax money left after the buckets' own RMD and the Traditional share of the year's spending draw from them.
   - **Then the Other-account IRA:** the RMD-bearing money left after its own RMD and its share of the spending draw. Annuities are never
     included (D-33).
   - **Order:** the conversion takes bucket money first, then the IRA (DD-1). The bucket share updates `tradFrac` / `rothFrac` exactly as
     today. The IRA share leaves `taxRmdA` / `taxRmdB` (split by their balances) and `taxOrd`. It **stays in the pool as tax-free money**, the
     same remainder HSA money sits in, so later spending of it is untaxed. MAGI carries the whole conversion, as today. Balances do not move:
     a conversion changes what the money is, not how much there is.
2. **The IRA's RMD tracker grows** at the pool's rate (`growth.tax`, the rate `taxOrd` uses), held inside the ordinary sub-pool
   (`taxRmdA + taxRmdB ≤ taxOrd`). **The sleeve's RMD leaves the IRA it was figured on**, as identified dollars; only the spending draw leaves
   it pro rata. Both choices follow `taxOrd`'s own rules (DD-2).
3. **Disclosure (DD-4):**
   - one sentence on the Withdrawal tab, next to the existing *Conv* sentence: conversions take bucket pre-tax money first, then a
     Traditional IRA entered under Other accounts, never annuity money; the order is the model's assumption;
   - METHODOLOGY §7 updated (its D-4 paragraph states Engine D's cap as `tradNotional − RMD`, and the D-33 section says Engine D
     "converts bucket money only");
   - MissingFeatures: D-34 closes, D-35 is filed.
4. Each row of Engine D's schedule publishes `convSleeve_y` (the part of `conv_y` taken from the IRA), for the tests. No figure reads it.

## 2 · Site census (parser, at the build; recorded in §7)

**App source:**
- `computeWithdrawalPlan` only: the conversion (L5643-5645, moved below L5768), the tracker shrink (L5766-5768), the bucket fraction update
  (L5804-5805), the pool's growth block (L5831-5841), and the schedule row (L5874);
- the Withdrawal tab's Section A copy (L9759).

`withdrawalPlanSeries` and every call site that reads it are untouched — Engines A, B and C receive different numbers through an unchanged
interface. The four version sites as usual.

**Suite:** a new `t71`, plus the re-gates found by running the whole current suite on the prototype. The run was session-only: the
prototype was staged as the current leg of a run folder built from `e01db32`. The built-page suites t45, t47 and t48 were not counted —
nothing here changes the built page's inputs — and they run in full at the build. Result: **6,348 passed, 7 failed**, every failure in two
suites.

- **`t19`, 4 failures.** Its mixed-pool pin of lifetime MAGI moves $3,162,820 → $3,191,209: the IRA's RMD now grows. Its independent
  LEDGER re-implements v6.07's tracker rules, so the gains sub-pool, gain and basis no longer match. Both are expected. The ledger gains
  v6.08's rules (growth, identified RMD, the conversion), and the pin is re-derived by the ledger, not copied from the engine. `t19` runs on
  the current leg only, so the ledger carries v6.08's rules alone; v6.07's rules move to `t71` §B, where they are checked against the prior
  leg.
- **`t70`, 3 failures.**
  - **D-1 and D-2** compare full schedule rows with v6.06, and the new `convSleeve_y` field makes the rows differ. With that one field set
    aside, all 16 runs and the example are bit-identical (checked). On the v6.07 → v6.08 pair, `app_v606.mjs` is absent, so §D takes its
    designed skip; the count change is disclosed, as `t69`'s was at v6.07.
  - **F-2** anchors v6.07's Engine D cap expression; it is re-gated per leg.
- **Clean:** `domdiff` 37/0 (the Withdrawal tab's DOM at the default slider is unchanged), parity, `t21`, `t29` and every other suite.

**Tools:** `qa/tools/boundaries.mjs` gains the rows OPERATIONS §K1 requires. The behaviour fixed here was invisible on the example
household, so the boundaries that hid it are added:
- the Other-account IRA is gone before the first RMD year;
- Engine D's bucket conversion cap does not bind at the slider.

## 3 · Tests — new `qa/t71_engine_d_other_ira.mjs`, both legs (the v6.07 leg pins the defects; the v6.08 leg asserts the fix)

- **§A Invariance** (cross-leg, importing the prior module, as `t70` §D does). These households are bit-identical in Engines D, B and C,
  field by field, with the Roth tab's strategies equal:
  - the example household at $0 and $70,000;
  - a no-Other-IRA variant;
  - the single-filer variant.
- **§B An independent ledger.** A simulator re-implements the Priority-1 pool's trackers and the conversion, year by year, with its own
  IRS divisors (the v5.37 method, `STOP-REPORT-v5_37-session1-E17-regime.md` §1).
  - **Inputs:** only the engine's mechanical series — draws, balances, published `taxable` and `taxGainPool`.
  - **Rules:** v6.07's on the prior leg and v6.08's on the current leg, so the oracle is itself validated against the shipped engine.
  - **Assertions:** `conv_y`, `convSleeve_y` and `rmd_y` to the cent, every year, on NAMED_IRA, MIXED and the example at $200,000, at two
    slider values.
- **§C Extinction invariants** (current leg; every fixture × $0 / $70K / $200K / $400K):
  - the conversion never exceeds the money left;
  - it never falls short of the slider while non-annuity pre-tax money remains;
  - an annuity-only pool converts nothing;
  - the balances are identical across slider values.
- **§D [KNOWN DEFECT] pins on the v6.07 leg:**
  - NAMED_IRA converts $50,000, not $840,000, with the IRA standing;
  - the tracker does not grow;
  - the sleeve RMD reduces the bucket cap;
  - the cap-year over-conversion ($2,672 at $200K).

  Each flips on v6.08.
- **§E** The Withdrawal tab's new sentence in the DOM (gated per leg). The boundary census rows read ON for the example household and
  clear for MIXED.
- **Controls:** `qa/tools/controls_v608_engine_d_ira.py`. Each fix is reverted one at a time in a staged copy, and the suite must go red
  for each.
- **The full suite runs from the packaged copies**, `package_check` and its controls in both phases (OPERATIONS §L).

## 4 · Out of scope, and stop conditions

**Out (recorded):**
- **D-35**, the Roth-under-Other-accounts double count (§0.2 (3)): filed with its measurements, scoped next, unless DD-3 (b).
- Engines A, B and C's own conversion rules (unchanged).
- D-9 (Engine D's growth rate is the scenario's, a decided difference).
- The Withdrawal tab's draw order.
- A household with **no holdings at all**: My Data saves `total401k` 0, and load heals it to the whole household. Engine D then holds
  every dollar in the buckets. This was seen while building fixtures and **not examined**; every fixture here carries holdings.

**Stop:**
- any figure moving on the example household at $0 or $70,000;
- any annuity dollar converted;
- the oracle failing to reproduce v6.07 on the prior leg;
- a balance moving with the slider.

## 5 · Decisions for Steve — **taken 2026-10-12: DD-1 (a), DD-2 (a), DD-3 (a), DD-4 (a)**

- **DD-1 · Where Engine D converts from.**
  - (a) **The buckets' pre-tax money first, then the Other-account Traditional IRA** *(recommended)*. The example household is unchanged
    at the default slider. Keeping the IRA as ordinary money longer is the conservative choice.
  - (b) Pro rata across both — closer to how Engines B and C pool it, but the example household moves at the default.
  - (c) Buckets only, with the cap's arithmetic fixed; the IRA is still never converted, and that is disclosed.

  All three fix the cap's two arithmetic errors (the IRA's RMD subtracted from bucket money; the spending draw ignored).
- **DD-2 · The IRA's RMD tracker** (growth, and the RMD as identified dollars).
  - (a) **Fix it in this release** *(recommended)*. It is the conversion's own cap, it is optimistic today, and the example household
    does not move.
  - (b) File it and do it next.
- **DD-3 · A Roth IRA under Other accounts (proposed D-35).**
  - (a) **File it with its measurements; scope it next** *(recommended)*. It moves every household with a Roth IRA under Other
    accounts, in two directions, and deserves its own measurement.
  - (b) Fold it in here.
- **DD-4 · Disclosure.**
  - (a) **One sentence on the Withdrawal tab plus METHODOLOGY** *(recommended)*.
  - (b) The same, plus a Field Manual sentence.
  - (c) METHODOLOGY only.

## 6 · Correction to this scope, made at the build

- **D-36 → D-35.** §0.2 (3), §1, §4 and DD-3 named the Roth finding D-36; D-35 was the next free ID, so it is filed as D-35 and this document now says so.
  Steve chose DD-3 (a) under the old name; nothing else changes.
- **§2's `t19` line said the MAGI pin would be "re-derived by the ledger, not copied from the engine".** The ledger reproduces the pool and, new here,
  the IRA's RMD every year; the MAGI pin itself was MEASURED at the build with both ends recorded (v6.07 → v6.08, +$28,389.02), the way v5.37 pinned it,
  and a second pin shows the whole move is the RMD.

## 7 · Build record (v6.08, 2026-10-12)

- **Source** `a739b64a9228ab4fd69fa8226552497b` (10 anchored edits, each counted once on v6.07: the conversion's old line removed, the IRA tracker's identified RMD and pro-rata
  spending shrink plus the new conversion block, the bucket fractions, the tracker's growth, the two published fields, the Withdrawal tab's sentence,
  four version sites). The staged engine was compared with the measured prototype on 25 household × slider runs — identical. **Built** `2e869c23540b8f8e851f714cb0c7ef2b`
  (`smoke_built` 22 passed, 0 failed); the v6.07 page rebuilt from its own source reproduced `5b444023…` first (OPERATIONS §N3a).
- **Census (parser, `census.cjs`, on the shipped source):** `_rmdShrink` 0 sites (was 3); `convBuckets_y` 5; `convSleeve_y` 7; `_spendShrink` 3;
  `conv_y` defined once in `computeWithdrawalPlan`, after the draws. `withdrawalPlanSeries` and every caller untouched.
- **No stop condition fired:** the example household bit-identical at $0 and $70,000 in Engines B, C and D and the strategies (`t71` §E); no annuity
  dollar converted (C-3); the oracle reproduced v6.07 on the prior leg (§B); no balance moved by a conversion (the oracle reproduces the pool).
- **Controls 10 of 10**, restored byte-identically, in a folder with its own `node_modules`. The first run reported 8 of 11: K1 (`t71` D-5 now asserts where the 2039
  conversion came from), K5 (its expectation named the wrong household) and an equivalent mutant, dropped and recorded in the script.
- **`t71`** 40 (v6.08) / 21 (v6.07). **Suite:** 6,515 app checks, 70 suites, 0 failed, 0 DIED; GRAND 6,645. Every current-leg count equals v6.07's (with `t13` at 53 from the ops package) but `t19` (67: the ledger reproduces the Other-account IRA's RMD, and `othOrdDraw` is pinned), `t29` (66 on both legs: the two new census rows), `t70` (33 on both legs: §D's v6.06 differential takes its designed skip on this pair) and the new `t71`; the v6.07 leg equals v6.07's own counts but `t29`, `t70` and `t71` (21, pinning the defects). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v607 v608 from the build workspace — a full clone of e01db32 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.07 resolved from history, commit 4cb6859) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6423, half B GRAND 222; none DIED.
