# SCOPE — v6.09 · D-35: a Roth IRA entered under Other accounts is counted once in the Withdrawal tab, as Roth money

**FULFILLED — shipped as v6.09 (2026-10-13).** Repo-only. §7 is the build record. D-35 closes.

*(Superseded status line, retained:)* **DRAFT — 2026-10-13, awaiting Steve's decisions (§5).** Repo-only. A MODELLING release (METHODOLOGY changes).
Steve, 2026-10-13: *"Let's build D-35"*.

## 0 · Premise (verified at v6.08, not assumed)

**Freshness (OPERATIONS §A).** Fresh clone of `origin/main` at `c76c385` (v6.08 and its chmod). Source `a739b64a9228ab4fd69fa8226552497b` = repo =
the pooled `DangerClose-v6_08.jsx` (hashed after `project_read`, 2026-10-13, at the v6.08 verification) = CHANGELOG newest. Built
`2e869c23540b8f8e851f714cb0c7ef2b` = live Pages. Pool 128, every name equal to the shipped list; `package_check` from the clone 53 passed, 0 failed.
The tag `v609` is free (`vercensus` 0 sites, the three Python lists, no `dom_entry_v609.jsx` in history).

### 0.1 · The law (primary sources, read 2026-10-13)

- **A Roth IRA's qualified distributions are not income.** 26 U.S.C. §408A(d)(1): *"Any qualified distribution from a Roth IRA shall not be
  includible in gross income."* Spending it realizes nothing — no ordinary income and no capital gain.
- **A Roth IRA carries no required distribution in the owner's life.** §408A(c)(4), *"Mandatory distribution rules not to apply before death."*

### 0.2 · What Engine D does (parser census, `qa/tools/census.cjs` on `src/DangerClose.jsx`)

Engine D (`computeWithdrawalPlan`, the Withdrawal tab; its spending-draw and realized-gain series also feed Engines A, B and C) puts every Other
account in its Priority-1 pool: `_taxInit = household − total401k` (L5502). A Roth IRA entered under Other accounts (`taxType: "roth"`) is then
counted **twice**:

1. **As brokerage money in the pool.** The pool's gains-bearing part is `_gainPoolInit = _taxInit − _taxOrdInit − _hsaInit` (L5513 — two sites,
   init and the `taxGainPool` seed at L5573). Ordinary and HSA money are taken out; Roth money is not, so it is treated as brokerage: its growth
   is booked as capital gain when it is spent, and that gain reaches the Taxes and IRMAA tabs through the gains bridge (`withdrawalPlanSeries`).
   The conservative direction, and wrong in law (§408A(d)(1)).
2. **Inside the buckets' Roth share.** `rothFrac = _rothInit / _t401kInit` (L5580), and `_rothInit = retireStartBalances().rothInit`, which
   includes `othRothA + othRothB` (L2338, L2354–2355). The buckets hold only the holdings' money, so their Roth share is overstated and their
   Traditional share — and every bucket RMD — understated. The optimistic direction.

Engines A, B and C are right: they count Other-account Roth money in each person's Roth balance (`rothInitA/B`) and keep it out of their taxable
balance (`taxableInitAll` takes only `taxable` and `hsa` Other accounts). Only Engine D is wrong, but A, B and C read its series.

The Withdrawal tab shows the double count too: the Priority-1 card's starting balance includes the Roth IRA ("everything you entered under Other
accounts"), and the Roth card's starting balance (`_rothInit`, L9893) includes it again.

### 0.3 · Measured (session-only prototype of §1; the engines at module level)

Fixtures are the example household plus Roth IRAs under Other accounts, each built the way My Data derives `household` / `total401k`.

| household | slider | lifetime RMD | realized gain | lifetime MAGI | Taxes tab: lifetime tax | IRMAA | Roth tab: model's best cell |
|---|---|---|---|---|---|---|---|
| example | $0 / $70K | identical | identical | identical | identical | identical | identical |
| + $200K Roth IRA (A) | $0 | 1,067,582 → **1,199,313** | 29,227 → **2,777** | 2,794,629 → **2,904,807** | 227,145 → **227,019** | 0 | Fill 12 % 5,218,938 → **5,217,600** |
| + $200K Roth IRA (A) | $70K | 343,192 → **470,488** | 29,227 → **2,777** | 2,974,976 → **3,077,153** | 215,825 → **215,702** | 0 | Fill 12 % 5,211,907 → **5,210,981** |
| + $300K (A) and $200K (B) Roth IRAs | $70K | 266,326 → **558,790** | 196,853 → **4,909** | 2,975,934 → **3,040,745** | 221,644 → **213,744** | 0 | Fill 12 % 6,142,577 → **6,147,910** |
| single filer + $200K Roth IRA | $70K | 119,509 → **153,755** | 19,160 → **1,821** | 1,876,907 → **1,928,782** | 220,145 → **221,830** | 3,450 → **1,150** | Fill 12 % 3,274,420 → **3,266,389** |

**The check that the fix is the right one:** with it, the example plus a $200,000 Roth IRA has *exactly* the lifetime RMD and first-year bucket
Traditional balance of the example plus $200,000 of brokerage ($470,488; $1,179,744). The two hold the same money in the same pool and differ only in
tax character, so the buckets must be identical. Its realized gain falls to $2,777, which is the example's own brokerage still being sold.

**What it says.** The example household has no Roth IRA under Other accounts and does not move. For a household that does:
- **The Withdrawal tab:** lifetime RMD and MAGI rise — the optimistic half goes. Phantom capital gain on Roth money disappears — $196,853 of it
  on the $500,000 fixture.
- **The Taxes and IRMAA tabs:** they move a little, both ways, through the two series they import. Less gain arrives (lower tax). A higher bucket
  Traditional share makes each spending draw from the buckets more ordinary (higher tax). Net, −$7,900 to +$1,685 on these fixtures.
- **The Monte Carlo** does not read Engine D.


## 1 · The change (recommended options)

1. **Roth money stays out of the pool's gains-bearing part.** `_gainPoolInit` also subtracts the Other-account Roth balance. It then sits in
   the pool's tax-free remainder, where HSA money and (since v6.08) converted IRA money already sit, so spending it is untaxed.
2. **The buckets' Roth share is the holdings' Roth only.** `rothFrac` uses `_rothInit` less the Other-account Roth balance, the same way
   `tradFrac` has used the holdings' Traditional money only since v5.26. `retireStartBalances` returns the Other-account Roth total
   (`othRoth`) so Engine D reads it rather than re-summing the rows.
3. **The Withdrawal tab (DD-2).**
   - The Roth card's starting balance shows the holdings' Roth money.
   - The Priority-1 card's tax-treatment sentence adds that Roth balances entered under Other accounts are spent tax-free and carry no RMD.
4. **METHODOLOGY:** a section and the D-34 section's cross-reference. **MissingFeatures:** D-35 closes.

## 2 · Site census (parser, at the build; recorded in §7)

**App source:**
- `retireStartBalances` — one returned field;
- `computeWithdrawalPlan` — `_gainPoolInit` and `rothFrac`, one site each;
- the Withdrawal tab — the Roth card's balance and the Priority-1 card's tax-treatment sentence;
- the four version sites.

`withdrawalPlanSeries` and every caller are untouched.

**Suite:** a new `t72`. The current suite was run against the prototype, which has the engine change but not the card copy: it was staged as
the current leg of the v6.08 run folder, with the built-page suites (half B) not run. Result: **6,423 passed, 0 failed** — identical to v6.08's half A.

**That is itself the finding: no existing check reaches a Roth IRA under Other accounts in Engine D.** `t71`'s oracle has no Roth fixture, and
`t19`'s mixed pool holds an IRA, brokerage and an HSA. The card copy (DD-2) will need `domdiff`'s byte-identity check to set its two changed
passages aside for the v6.08 → v6.09 pair, as v6.08 did for its one sentence.

**Tools:** the boundary census gains one row (OPERATIONS §K1): a Roth IRA under Other accounts. It reads ON for the example household (it holds
none), and a fixture clears it.

## 3 · Tests — new `qa/t72_engine_d_other_roth.mjs`, both legs (the v6.08 leg pins the defect, the v6.09 leg asserts the fix)

- **§A · The equivalence.** A Roth IRA and the same money as brokerage give an identical bucket side: `tradNotional`, every bucket balance,
  lifetime RMD and `rmd_y` per year. On the v6.08 leg this is pinned unequal ([KNOWN DEFECT]).
- **§B · No gain on Roth money.**
  - An all-Roth pool realizes $0 of gain, every year.
  - The Roth IRA's growth adds no gain: the household's lifetime gain equals that of the same household without the Roth IRA's share of the
    pool, measured through `taxGainPool`.
- **§C · An independent oracle.** It re-implements the pool's trackers with the Roth money held out (t71's oracle, extended). It must
  reproduce each leg to the cent under its own rules, and miss the other leg's.
- **§D · Cross-leg invariance.** Households with no Roth IRA under Other accounts — the example at $0 and $70,000, the single-filer variant —
  are bit-identical in Engines B, C and D and the Roth tab's strategies.
- **§E · The DOM.** The Roth card shows the holdings' Roth balance, and the Priority-1 card carries the sentence.
- **Controls:** `qa/tools/controls_v609_engine_d_roth.py`. Each fix is reverted alone, and each reversion must turn a check red.
- **The full suite** runs from the packaged copies; `package_check` and its controls run in both phases (OPERATIONS §L).

## 4 · Out of scope, and stop conditions

**Out (recorded):**
- **The draw order.** The Priority-1 pool — Roth money under Other accounts included — is still spent first, the opposite of the Roth card's
  "why last". That has been the design since v5.26: the pool's order is not touched, only its tax character. Spending tax-free money first leaves
  Traditional money growing longer, which is the conservative direction.
- **The five-year rule and pre-59½ withdrawals.** Every Roth dollar is treated as qualified, as the holdings' Roth money already is.
- Engines A, B and C's own Roth handling (already right).
- A household with no holdings at all (the healing noted at v6.08 — still not examined).

**Stop:**
- any figure moving for a household with no Roth IRA under Other accounts;
- the Roth fixture's bucket side differing from its brokerage twin;
- any gain realized on an all-Roth pool.

## 5 · Decisions for Steve — **taken 2026-10-13: DD-1 (a), DD-2 (a)**

- **DD-1 · What to fix.**
  - (a) **Both halves together** *(recommended)*. Each half on its own leaves the other's error standing, one in each direction.
  - (b) The gains half only. This removes the conservative error and leaves the optimistic one, so the plan would look better than it should.
  - (c) The bucket half only. The plan looks worse, and it is still wrong in law.
- **DD-2 · The Withdrawal tab's cards.**
  - (a) **The Roth card shows the holdings' Roth money, and the Priority-1 card says Roth balances entered under Other accounts are spent
    tax-free with no RMD** *(recommended)* — each dollar shown once, where the engine holds it.
  - (b) Leave the cards; disclose in METHODOLOGY only (a Roth IRA under Other accounts stays shown in both cards).

## 6 · Correction to §2, made at the build

§2 recorded the prototype run as the whole suite passing unchanged. That run had the engine change but not the card copy, and the card copy
added `_rothOth` to what Engine D returns — which `t19`'s contract check (the exact set of names the Withdrawal tab's JSX destructures) pins.
The final run caught it (one red check); the contract now names `_rothOth`, and half A was re-run whole.

## 7 · Build record (v6.09, 2026-10-13)

- **Source** `a32ef4531f4b46e18d26ad9accd8a00a` (12 anchored edits, each counted once on v6.08: `retireStartBalances`' returned total; Engine D's `_rothOth`, `_gainPoolInit`,
  `rothFrac` and return; the Withdrawal tab's destructure, Roth card and Priority-1 sentence; four version sites). The staged engine was compared
  with the measured prototype on ten household × slider runs — identical. **Built** `df3d3e7e71df9690ba7183b5411bf653` (`smoke_built` 22 passed, 0 failed); the v6.08 page rebuilt from
  its own source reproduced `2e869c23…` first (OPERATIONS §N3a).
- **Census (parser, `census.cjs`, on the shipped source):** `_rothOth` 6 source sites (Engine D's definition, the gains part, `rothFrac`, the return;
  the tab's destructure and Roth card); `othRoth` 2 (`retireStartBalances`' field, Engine D's read). `withdrawalPlanSeries` and every caller untouched.
- **No stop condition fired:** the households with no Roth IRA under Other accounts bit-identical (`t72` §D); the Roth fixture's buckets equal its
  brokerage twin's (§A); no gain on an all-Roth pool (§B).
- **Controls 6 of 6**, restored byte-identically, in a folder with its own `node_modules`; every control fired on the first run.
- **`t72`** 29 (v6.09) / 17 (v6.08). **Suite:** 6,558 app checks, 71 suites, 0 failed, 0 DIED; GRAND 6,688. Every current-leg count equals v6.08's but `t29` (69 on both legs: the new census row), `t71` (26 on both legs: §E's v6.07 differential takes its designed skip on this pair) and the new `t72`; the v6.08 leg equals v6.08's own counts but `t29`, `t71` and `t72` (17, pinning the defect). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v608 v609 from the build workspace — a full clone of c76c385 carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.08 resolved from history, commit b6eb255) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6466, half B GRAND 222; none DIED.
