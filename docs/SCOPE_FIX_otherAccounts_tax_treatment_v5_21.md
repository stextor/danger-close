# SCOPE — Give `otherAccounts` a tax treatment (finding D-2D-3)

**REVISION 2 — supersedes `SCOPE_FIX_otherAccounts_tax_treatment_v5_15.md`.**
**Status:** **§7 RESOLVED 2026-08-10.** Nothing built in the re-verification session. Release (a) —
the residual consolidation — is scoped separately in `SCOPE_CONSOLIDATE_taxable_residual_v5_22.md`
and is the next build. Releases (b) and (c) build from §4 and §6 of this document, in that order.
**Anchored to:** v5.21 · `src/DangerClose.jsx` md5 `0c3cf58994326a5eda39f7ec46957f51` ·
built `index.html` md5 `e3e2e380f68e6deabae6ed03371f2c09` · repo HEAD `683a3d5` (2026-08-10)
**Written:** 2026-08-10 · **Method:** acorn AST resolution for every census claim; executed DOM probe
for the Engine D trap; no greps used for line numbers or site counts.

**Why a revision rather than a build.** The v5.15 scope was re-verified against v5.21 before building,
as instructed. Three of its load-bearing claims did not survive, and the census grew for a fourth
consecutive release. Under the standing rule — *if evidence contradicts the scope's premise, STOP and
report* — this replaces the scope instead of building from it.

---

## 0. Provenance and workspace integrity

Verified before any analysis:

| Check | Result |
|---|---|
| Manifest version + md5 vs hashed knowledge source | v5.21 · `0c3cf5…f51` — match |
| Manifest vs CHANGELOG newest entry | both v5.21 — match |
| CHANGELOG provenance line vs committed `src/DangerClose.jsx` | match |
| CHANGELOG provenance line vs committed `index.html` | `e3e2e3…c09` — match |
| Prior build | v5.20 · `9b6780…3e` — match |
| v5.20 → v5.21 diff | 3 lines, 4 version strings (L3224, L3286 ×2, L10473) — consistent with "only the version string changed" |
| All shared files, fresh clone vs project knowledge | **27 of 27 byte-identical.** No phantom edits. |
| Suite total re-derived from the per-suite breakdown | 382 + 8 + 361 = **751** (+16 built) — CHANGELOG arithmetic correct |
| DOM harness validated before any DOM figure was read | `t9_dom_smoke` **14/14** |

*(The single apparent hash difference in the clone comparison resolved to a rename: repo
`qa/qa-baseline/README.md` == knowledge `qa-baseline-README.md`.)*

**Unrelated defect found while checking:** `TESTING.md` line 54's parenthetical still reads *"638 of
these are unchanged from v5.17; the other 63 are the new `t17`"* — the v5.18 composition (638+63=701).
The sentence's own arithmetic (382+8+361=751) is right; the parenthetical was not rolled forward at
v5.19–v5.21. That page carries a standing disclosure about exactly this class of error recurring, so it
should be corrected in the next release regardless of what happens to this scope.

---

## 1. THREE CORRECTIONS TO THE PREMISE

### C1 — Engine D does not tax this money at all. Not at capital-gains rates; **at zero.**

`FlawsToFix-v5_15-Phase2D.md` §2(b) states Engine D "draws it down at capital-gains treatment." That is
wrong, and it is the third consecutive revision of this finding to state a mechanism incorrectly.

Verified at the line, v5.21:

```js
L7528  const _taxInit = Math.max(0, PORTFOLIO.household - PORTFOLIO.total401k);   // = $147,000
L7569  let taxable = _taxInit;
L7641  if (remaining > 0) { drawFromTaxable = Math.min(remaining, taxable); ... }  // drawn FIRST
L7685  // Conversion adds to MAGI. RMD and tradDraw are also taxable. Taxable-account draws are not
L7686  const magi = taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + conv_y;
```

`drawFromTaxable` is **absent from `magi`**. There is no LTCG term anywhere in Engine D. So the $147,000
— which on the shipped household includes **$90,000 of named traditional IRA and $21,000 of
annuity / state plan**, $111,000 of genuinely tax-deferred money — is spent **entirely tax-free and
RMD-free**, and its growth is untaxed too.

**The direction of the finding is unchanged and its magnitude is larger than recorded.** But the fix has
to be specified against what the code does, not against what the finding said it does.

### C2 — "Undisclosed" is wrong. It is **disclosed in one place and contradicted in two.**

Checked in all four places the method requires — the comment beside the code, METHODOLOGY, the in-app
text, and the audit/FlawsToFix documents:

| Where | What it says | Verdict |
|---|---|---|
| MyData, **L11211** | *"Retirement-account holdings only — 'Other accounts' below aren't classified."* | **Disclosed.** Accurate. |
| MyData header, L11221 | `OTHER ACCOUNTS (HSA, brokerage, cash, etc.)` | Accurate. (The finding says it is "headed simply *Other accounts*." It is not.) |
| Withdrawal tab, **L7822–7823** | *"Emergency Fund and any after-tax / taxable brokerage. Starting balance: $147K… Already-taxed principal. Only the gains are taxed (long-term cap gains 0/15/20%)."* | **False on the example household** for $105K of the $147K — and it promises an LTCG treatment the engine does not implement (see C1). |
| Field Manual (`DOCS_HTML`), 1 occurrence | *"any non-retirement 'other accounts'"* | **False** for $111K of the $147K. |
| Field Manual §13 Limitations | no mention | Silent — and this is the section where it belongs. |
| METHODOLOGY.md | **0 occurrences** of `otherAccounts` or "other account" | Silent. |
| Code comment, L417 | `// Sum of all bucketed positions (excludes otherAccounts)` | Mechanical note; not a tax-treatment disclosure. |
| Phase 2B/2C audits, standing audit | 0 occurrences | Never previously closed. |

The honest restatement is **worse than "undisclosed," not better**: the app volunteers two positive
statements about this money that are false for most of it, and they contradict the one place that is
accurate.

### C3 — The census grew again, and one §1 row is wrong.

The v5.15 scope predicted this and said to stop if it happened. It happened.

**The Roth tab reads `otherAccounts` directly** — `L8384`, inside the `activeTab === "roth"` block —
summing the positions taxable residual **plus every dollar of `otherAccounts`** to decide whether to warn
"you have almost no money outside retirement accounts." The §1 row *"Roth ladder | no"* is true of the
ladder's arithmetic and false of the tab: this site counts the $90,000 IRA as spendable outside money for
paying conversion tax. That is a **fifth** distinct treatment of the same array.

**The taxable residual is at seven sites, not five.** Resolved structurally (any `balance − roth − trad`
subtraction), not by grep:

| # | Line | Scope | Note |
|---|---|---|---|
| 1 | L3847 | `computeIrmaaPlan` (Engine C) | engine-internal |
| 2 | L4056 | `computeTaxPlan` (Engine B) | engine-internal |
| 3 | L4353 | `rothSolve` useMemo | builds `taxableInit` for Engine A |
| 4 | L8384 | Roth tab funding gate | **also adds `otherAccounts`** |
| 5 | L8432 | Roth tab main `P` | builds `taxableInit` for Engine A |
| 6 | L8566 | Roth tab solve-for grid `PO` | builds `taxableInit` for Engine A |
| 7 | L9706 | What-breaks tab | builds `taxableInit` for Engine A |

Hoisting Engines B and C to module level (v5.17–v5.19) **multiplied** the duplication: Engine A no longer
computes the residual itself, so each of its four callers does.

---

## 2. WHAT IS CONFIRMED UNCHANGED

Every figure below was computed from the AST of the shipped `DEFAULT_PORTFOLIO`, not restated:

- `otherAccounts` = **$147,000** across 9 entries; **8.93%** of the $1,647,000 household.
- `household − total401k` = **$147,000 exactly** — Engine D's taxable pot *is* `otherAccounts`, entire.
- Named traditional IRA money: **$90,000** (Rollover IRA (A) $70K + Traditional IRA (A) $20K).
- Genuinely taxable brokerage: **$21,000**. Annuity + state plan: **$21,000**. HSA: **$15,000**.
- Engines A, B, C carry **zero** references to `otherAccounts` (parser-confirmed over L3376–4234), and
  `retireStartBalances` (L1513) reads `positions` only. The invisibility half of the finding holds exactly.
- No `otherAccounts` entry carries any field but `name` and `balance` — no `owner`, no tax split.

---

## 3. THE STRUCTURAL TRAP — EXECUTED, NOT REASONED

The v5.15 scope predicted `_taxInit` would collapse to $0 and called it silent. **Executed** against
v5.21 via the validated DOM harness, supplying the post-fold data state through `applyLoadedData` with
**no source modification** (`qa/p1_engineD_trap.mjs`, `qa/p2_buckets.mjs`):

| State | `total401k` | Engine D taxable start | trad | roth | threw / warned? |
|---|---|---|---|---|---|
| Shipped v5.21 | 1,500,000 | **$147K** | $1,288K | $315K | — |
| Folded into `positions`, Engine D untouched | 1,647,000 | **$0K** | $1,399K | $330K | **NO — silent** |

Zero console errors, zero warnings, the Withdrawal tab renders normally. **The trap is confirmed silent.**

**And it is worse than recorded.** The $21,000 of genuine brokerage — trad 0, roth 0, pure residual —
does not move to another pot. It **leaves Engine D's accounting entirely**: the three priority balances
sum to $1,729K after the fold versus $1,750K before, against an unchanged household. Twenty-one thousand
dollars silently stops existing on that tab.

**`bucketActuals` did not move on this path**, which is better news than expected: `applyLoadedData` only
re-derives them when they sum below 0.95 (L2866–2884), so a folded *backup load* preserves the Monte
Carlo basis. That is one parity risk retired.

### 3a. NEW — `total401k` is derived three different ways, so Option B is path-dependent

This is not in the prior scope and it changes the fix's shape:

| Entry path | `total401k` becomes | Effect of folding into `positions` |
|---|---|---|
| **XLSX importer**, L2428–2430 | `bucketSheetTotal` — the *Bucket Allocations sheet* is authoritative and independent of `positions` | `total401k` **does not rise** → `_taxInit` stays $147K → **trap does not fire; the money is instead counted twice**, once in positions (now visible to A/B/C) and again in Engine D's residual |
| **`applyLoadedData`**, L2857–2865 | heal-only; recomputed *solely* if absent or ≤ 0 | folded backups keep whatever `total401k` they carry |
| **MyData editor**, L10681 / L10725 | `positions.reduce(...)` over **all** positions | `total401k` **rises** → trap fires (as executed above) |

So the same fix produces a **collapse to $0 on one path and a double-count on another**. A single-path
test would pass while the other path is wrong — which is why this belongs in the scope and not in the
build.

There is a second, *derived but not executed*, leak on the MyData path: `t401` (L10681) sums **all**
positions while `ba` (L10683–10684) accumulates only buckets 1–4, so folding unbucketed accounts makes
`bucketActuals` sum to 1,500,000 / 1,647,000 = 0.9107. `applyLoadedData`'s heal fires below 0.95 but
recomputes by the same formula and returns the same 0.9107. **Stated as a risk, not a finding — I did not
execute the MyData or importer paths.** It must be executed before build.

---

## 4. REVISED SITE CENSUS (v5.21 lines, parser-resolved)

| # | Site | v5.21 lines | Change required |
|---|---|---|---|
| 1 | XLSX importer — `otherAccounts.push` | 2306, 2324 | emit `positions` entries with a tax split |
| 2 | Importer `household` fallback | 2344–2345 | must not move |
| 3 | Importer `total401k` / `bucketActuals` | 2418–2437 | **sheet-authoritative** — decide interaction with the fold (§3a) |
| 4 | Guided wizard | 3000, 3053 | "Cash + taxable outside retirement" — intent is already taxable |
| 5 | `applyLoadedData` owner inference | 2744–2745 | migration hook lives here |
| 6 | `applyLoadedData` heal + bucket renormalize | 2857–2884 | must survive positions containing taxable accounts |
| 7 | **Engine D taxable pot** | **7528** | off `household − total401k`; onto the positions residual |
| 8 | **Engine D bucket inits** | **7531–7534** | denominator must exclude taxable positions |
| 9 | **Engine D `magi`** | **7686** | **NEW — C1.** If these dollars become trad, they must enter MAGI and RMD |
| 10 | Engine D rendered copy | 7822–7823 | **NEW — C2.** Currently false; must change with the treatment |
| 11 | Roth tab funding gate | **8384** | **NEW — C3.** Counts IRA money as spendable outside money |
| 12 | Taxable residual, **×7** | 3847, 4056, 4353, 8384, 8432, 8566, 9706 | consolidate (D-2D-2, recounted) |
| 13 | MyData rollup + `buildPortfolio` | 10622–10627, 10679–10684, 10725–10727 | round-trip must not lose the split; bucket leak (§3a) |
| 14 | MyData disclosure line | 11211 | currently accurate; must stay accurate after the fix |
| 15 | Field Manual "non-retirement" | `DOCS_HTML` L3286 | **NEW — C2.** False today |
| 16 | METHODOLOGY | doc | no mention at all |

**Nine sites the v5.15 scope did not have.** Its own instruction was to stop if the census grew.

---

## 5. PARITY POSITION

`t2 compare` must stay **8/8 strict**. The executed probe shows `household` and `bucketActuals` are
preserved on the backup-load path, so 8/8 is achievable — but only if the importer and MyData paths are
built so that neither `household` nor the bucket weights move (§3a). **If parity breaks, the fix has
reached the Monte Carlo and has overreached** — that is not an `INTENDED_DIFFS` candidate.

Engine D's own output **will** move, and that is the point of the release. `t12_engineD_survivor`
asserts Engine D balances and must be re-verified case by case, with every movement explained.

---

## 6. TESTS THIS MUST SHIP WITH (revised)

1. **The cross-engine invariant whose absence is this finding** — the same account produces the same tax
   treatment in all five engines, asserted **per engine at its own basis**, never through a shared helper.
2. **A named traditional IRA in `otherAccounts` produces an RMD** — dollar-exact via Engine A (`t10`
   single-year isolation technique).
3. **It also produces ordinary income in Engine D's `magi`** — the C1 assertion. Absent today, and it is
   the one that would have caught this.
4. **A brokerage account stays taxable in Engine D** and does not vanish (the $21K disappearance, §3).
5. **`household` and `bucketActuals` byte-identical before and after, on all three entry paths** (§3a).
6. **Backup round-trip** — a pre-fix save loads, migrates, produces the same `household`.
7. **Every new assertion negative-controlled against v5.21**, failure count recorded per case. `t17` fails
   23/63 and `t18` fails 24/47 as the reference profile for what a real control looks like.
8. **`t12` re-verified**, every moved figure explained.

---

## 7. DECISIONS — RESOLVED 2026-08-10 (Steve)

**All seven resolved, all as recommended.** Recorded here so the record is durable rather than
conversational. The build gate is open for release (a) only; (b) and (c) build in sequence after it.

| | Decision | Resolved |
|---|---|---|
| D-1 | Tax split per name | Rollover/Traditional IRA, State Plan, Annuity → **trad**; three Brokerages, Taxable Brokerage, Outside Account → **taxable** |
| D-2 | HSA | **Held out of the split entirely** — stays in `household` and the Monte Carlo, classified as neither trad nor Roth, disclosed in Limitations. The v5.10 `contribAccrual` decision stands; balances and contributions now agree. |
| D-3 | Uninformative hand-typed names | Default **trad**, stated in the MyData hint |
| D-4 | Where the fold happens | **`applyLoadedData`**, not the parsers |
| D-5 | False in-app copy | **Rewrite both sites + Limitations entry.** Sub-decision: the disclosure **says what changed** for existing users, not just current behaviour |
| D-6 | ×7 consolidation | **Its own release, first** |
| D-7 | Release shape | **Three releases**: (a) consolidate residual · (b) Engine D `magi` + false copy · (c) fold and classify |

The original text of each decision, with the reasoning and trade-offs as presented, is preserved below.

---

### The decisions as put (for the record)

Only D-1 survives from the old list unchanged. D-2 now conflicts with a documented design decision, and
three decisions are new.

### D-1 · Tax split per account name *(unchanged, still recommended)*
Rollover IRA / Traditional IRA → **trad** · Spouse B State Plan → **trad** · Spouse B Annuity → **trad**
(qualified is the common case, and it is the conservative reading) · Brokerage ×3 / Taxable Brokerage /
Outside Account → **taxable** · HSA → see D-2.

### D-2 · HSA — the old recommendation contradicts a decision already on the books
The v5.15 scope recommended mapping HSA → Roth. But `contribAccrual`'s header comment (L1487–1489) records
the opposite decision, taken at v5.10 and still shipping:

> *"HSA is deliberately EXCLUDED (§4): HSA dollars are neither Traditional (no RMDs, tax-free for medical)
> nor Roth — routing them into either bucket would manufacture wrong RMDs or wrong tax-free capacity;
> they continue to flow into the MC total as today."*

That reasoning applies to the $15,000 HSA *balance* exactly as it applied to HSA *contributions*.
**Revised recommendation: hold HSA out of the tax split** — keep it in `household` and the Monte Carlo,
classify it as neither trad nor Roth, and disclose it in the Limitations section. It is $15,000 of
$1,647,000, and consistency with a standing decision is worth more than the precision. **Your call: honour
the v5.10 decision, or overturn it deliberately for both balances and contributions at once.** What should
not happen is the two halves of the app disagreeing about HSAs.

### D-3 · Hand-typed accounts with uninformative names *(unchanged)*
Default to **trad** (conservative: fully taxable, RMD-bearing) and say so in the MyData hint.

### D-4 · NEW — which path does the fold happen on? (§3a)
Folding at the importer collides with the Bucket Allocations sheet being authoritative for `total401k`.
**Recommendation: fold in `applyLoadedData`, not in the parsers** — one choke point that every path already
passes through, matching the `streamsMonthlyAt` pattern §4 of the finding explicitly recommends copying
("streams were built so no engine has to remember; accounts were not"). It also gives migration and fresh
import the same code path for free.

### D-5 · NEW — the in-app copy is currently false. What replaces it?
Withdrawal L7822–7823 and the Field Manual both describe this money as non-retirement / already-taxed.
After the fix those sentences are wrong in a *new* way unless rewritten. **Recommendation: rewrite both,
and add a Limitations entry.** This makes it a METHODOLOGY release, not just a modeling one. **Do you want
the disclosure to say what changed for existing users** — i.e. "your plan's tax figures moved because
accounts you listed as Other are now classified" — or to describe only the current behaviour?

### D-6 · NEW — does the ×7 residual consolidation ship in the same release?
The old D-4 said yes at five sites. At seven, with four of them being P-object constructions for Engine A,
**the recommendation still holds but the risk is higher**: Engine D becomes an eighth site, and adding a
copy while fixing a duplication defect would be perverse. **Recommendation: consolidate, but as its own
release *before* the tax-treatment change** — a pure-refactor release provable at 8/8 strict parity with
every one of the 751 checks identical, exactly the shape v5.19 and v5.21 already proved works. Then the
tax change lands on one call site instead of eight.

### D-7 · NEW — numbers users can feel. Is one release the right shape at all?
This moves the Withdrawal tab's tax, MAGI and bracket figures for every household with Other accounts,
and it is the first release in six to do so. The alternative to one big release is three:
**(a)** consolidate the residual (parity-provable, no user-visible change), **(b)** fix Engine D's `magi`
and the false copy, **(c)** fold and classify. **Recommendation: three releases in that order.** Each is
independently verifiable, and (a) makes (c) small. Say if you would rather take it in one.

---

## 8. Honesty statement

Every line number, site count and scope attribution in this document was resolved with an acorn AST walk
over the canonical v5.21 source; none came from a text search, and none from memory. The example-household
figures were computed from the parsed `DEFAULT_PORTFOLIO` object, not restated. The Engine D trap in §3 was
**executed** against a validated harness (`t9` 14/14 first), with no source modification, and both the
collapse to $0 and the silence were observed rather than inferred.

**Not executed, and labelled as such:** the `bucketActuals` leak on the MyData and importer paths (§3a,
second half) is derived from source and has not been run. The seven-site consolidation has not been
attempted. No test in §6 has been written. No source has been changed; the workspace source hashes
identical to the committed tree.

**What I got wrong is recorded above, not softened:** this scope's own predecessor was wrong about Engine
D's tax treatment, wrong about disclosure, and short on the census by nine sites — and the finding it
derives from has now mis-stated its mechanism in three consecutive revisions. That pattern, not the
$147,000, is the argument for the invariant test in §6.1.
