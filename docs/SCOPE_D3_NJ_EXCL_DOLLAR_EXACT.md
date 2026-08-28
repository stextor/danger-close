# SCOPE — D-3c dollar-exact: New Jersey's income-limited retirement exclusion

| Field | Value |
|---|---|
| Premise verified against | **v5.53** · source `12a007ed8e57a391acba67b799eb5a2f` · tree `74497fd` |
| Written | 2026-08-28 |
| Origin | **Decision D3 of `docs/SCOPE_STATE_FIXTURES.md`** — the last ratified decision from that scope left undone |
| Shape | **Test infrastructure only.** No source change. No figure moves. No version bump. |
| Status | **Awaiting decisions in §7 — do not build yet** |

**Baseline confirmed by command this session**, not carried forward: full suite **2,738 app checks / 0
failing** (v5.52 leg 1,025 · v5.53 leg 1,035 · parity 10/10 · ungated feature 668), tooling 82,
`smoke_built` 16/16, **0 died**. Run from a clean clone of `74497fd`, not from the knowledge pool —
see §6.

---

## 1. What this ships

One new archetype in **`t10_taxcases.mjs` §2E**, the existing state-tax-module section: a
**dollar-exact** case for the D-3c class — a state whose 65+ retirement-income exclusion is
**income-limited in law** but applied **unconditionally** by `stateTaxAnnual` — hand-verified
against the New Jersey Division of Taxation.

**Explicitly NOT in this job: fixing D-3c.** This builds the instrument, not the repair.
`SCOPE_STATE_FIXTURES` §4 is explicit and this scope does not reopen it.

## 2. Premise, verified against source

`stateTaxAnnual`, v5.53 **L1114–L1130** (`funcmap.cjs`; confirmed by reading the lines):

```
excl    = (r.excl65 || 0) * max(0, persons65)          // UNCONDITIONAL — the defect
retBase = r.retExempt ? 0 : max(0, retIncome + pen - excl)
ssBase  = (r.ss || 0) * max(0, ssTaxableFed)
tax     = r.rate * (retBase + max(0, work) + ssBase + max(0, capGains))
```

**NJ at v5.53, L1059**, verbatim:

```js
NJ: { name: "New Jersey", rate: 0.055, ss: 0, retExempt: false, excl65: 75000,
      note: "retirement-income exclusion up to $75K/person — INCOME-LIMITED (~$150K); approximated as unconditional" },
```

So the model grants a 65+ couple **$150,000** of exclusion at every income level. New Jersey does
not. That gap is the test.

### Call-site census — `census.cjs`, corroborated by a length-filtered grep

| Line | Enclosing scope | Engine |
|---|---|---|
| L1114 | definition | — |
| L3965 | `_estSaleGain` < `run` < `runRothStrategies` | **A** |
| L4082 | `run` < `runRothStrategies` | **A** |
| L5231 | `computeTaxPlan` (L4962–5280) | **B** |

**Three call sites, not two, and the third is in Engine B.** This corrects the session brief — see §5.

## 3. The primary sources

Both are the New Jersey Division of Taxation's own pages. Neither is a summary site, and neither is
the model's `note`, which is the thing under test rather than a source.

**[S1] Retirement Income Exclusions** — `nj.gov/treasury/taxation/njit7.shtml`, Last Updated
**12/03/25**.

- Age gate is **62**, not 65. Eligibility also requires **total income ≤ $150,000**.
- The maximum exclusion is a **household cap by filing status**, *not* per person:

  | Total income | MFJ | MFS | Single / HoH / QW |
  |---|---|---|---|
  | $1 – $100,000 | **$100,000** | $50,000 | $75,000 |

- Above $100,000 the exclusion becomes a **percentage of taxable pension**, by band:

  | Total income | MFJ | MFS | Single / HoH / QW |
  |---|---|---|---|
  | $100,001 – $125,000 | 50% | 25% | 37.5% |
  | $125,001 – $150,000 | 25% | 12.5% | 18.75% |
  | $150,001 or more | **not eligible** | not eligible | not eligible |

- Claim is "the lesser of your actual taxable pension income or the maximum pension exclusion
  amount for your filing status and gross income."

**[S2] New Jersey Tax Rate Schedules, Table B (MFJ/HoH/QW)** —
`nj.gov/treasury/taxation/pdf/current/njtaxratesch.pdf`, linked from
`nj.gov/treasury/taxation/taxtables.shtml` (Last Updated **03/24/26**) as **"2020 and After"**. NJ's
brackets are not indexed, so the schedule the Division serves at `current/` is authoritative for
2026 even though the sheet itself is headed 2020.

| Over | But not over | Rate | Subtract |
|---|---|---|---|
| $0 | $20,000 | 1.4% | $0 |
| $20,000 | $50,000 | 1.75% | $70.00 |
| $50,000 | $70,000 | 2.45% | $420.00 |
| $70,000 | $80,000 | 3.5% | $1,154.50 |
| $80,000 | $150,000 | 5.525% | $2,775.00 |
| $150,000 | $500,000 | 6.37% | $4,042.50 |
| $500,000 | $1,000,000 | 8.97% | $17,042.50 |
| $1,000,000 | — | 10.75% | $34,842.50 |

**[S3] Personal exemptions** — `nj.gov/treasury/taxation/njit2.shtml` and `njit13.shtml`, and the
**2026 Form NJ-1040-ES** instructions (`pdf/current/1040esi.pdf`): $1,000 regular each, plus $1,000
each at 65+. A MFJ couple both 65+ therefore has **$4,000**. The 2026 NJ-1040-ES also restates the
62+/$150,000 exclusion rule, which is the tax-year-2026 confirmation that [S1] still governs.

> ⚠ **Watch item, secondary source only, NOT relied on here.** A commercial guide references NJ bill
> **S4930**, which would replace the graduated schedule with a flat 5.9% from TY2026, and states it
> had not been enacted. The Division's own pages show the graduated structure in effect as of
> 03/24/26. **Unverified against the Legislature — do not cite it in a deliverable without checking.**

## 4. The figures, hand-computed then compared

Household: **MFJ, both 65+, NJ, retirement income only** — no Social Security (NJ excludes it from
gross income entirely), no wages, no capital gains. Total income therefore equals retirement income,
which is what makes the exclusion band unambiguous.

Every NJ figure below was computed from [S1]/[S2] by two independent methods — the schedule's
"subtract" form and an explicit band-by-band bracket walk — which **agree to the cent at every
point**. Model figures were **executed** against `app_testable.mjs`, not read off the code.

| Total income | NJ exclusion [S1] | NJ base | NJ tax [S2] | NJ tax after $4,000 exemptions [S3] | Model exclusion | **Model tax** |
|---|---|---|---|---|---|---|
| $90,000 | $90,000 | $0 | $0.00 | $0.00 | $90,000 | **$0.00** |
| $120,000 | $60,000 | $60,000 | $1,050.00 | $952.00 | $120,000 | **$0.00** |
| $140,000 | $35,000 | $105,000 | $3,026.25 | $2,805.25 | $140,000 | **$0.00** |
| $200,000 | $0 | $200,000 | $8,697.50 | $8,442.70 | $150,000 | **$2,750.00** |

$90,000 is the **agreement point** and earns its place: below the threshold the model and the statute
both shield everything, so the case set cannot be read as "the model is simply always wrong."

### The effects separate, and they point in opposite directions

At $200,000, decomposed one term at a time:

| Step | Figure | Effect |
|---|---|---|
| Model as shipped | $2,750.00 | — |
| Correct exclusion, model's flat 5.5% | $11,000.00 | **exclusion +$8,250.00** (model understates) |
| + NJ Table B graduated schedule | $8,697.50 | **rate −$2,302.50** (flat 5.5% overstates) |
| + NJ personal exemptions | $8,442.70 | **exemption −$254.80** (model omits) |
| **Model error vs full NJ liability** | | **−$5,692.70** — model understates |

**The exclusion error and the rate error have opposite signs.** That is stronger than the brief's §4
asked for: a single wrong figure cannot be explained by either error alone, because either one alone
would have moved the answer the other way. The net direction is **optimistic** — the model
understates New Jersey tax — which is the direction this project treats as the wrong way to be wrong.

**Boundary, disclosed rather than quietly chosen.** The model has no personal-exemption concept, so
the comparable quantity is the no-exemption column; the exemption column is included anyway so the
household's actual liability is on the record and the test cannot be accused of picking the
flattering comparison. The test will assert against the model's own terms and carry both figures.

## 5. ⚠ FINDING — the session brief's §3 is wrong in four places, and its own governing scope was right

The brief spends §3 on "D3 named `t10`, and that needs ten minutes of checking before you build."
The checking was done. **D3's host was correct**, but every reason the brief gave for doubting it is
false, and `SCOPE_STATE_FIXTURES.md` §1 already said so.

| Brief §3 says | Verified |
|---|---|
| "`stateTaxAnnual` is called at L3964 and L4081, both inside `runRothStrategies`" | **Three** call sites; L5231 is inside `computeTaxPlan` |
| "neither `stateTaxAnnual` call is in Engine B" | L5231 **is** Engine B. The brief records rejecting `t18` on this basis and says the correction "cost one command" — the correction was itself wrong |
| "Verified: NO suite anywhere passes a real state code" | `t3_roth.mjs` L41 sets `stateCode: "GA"`; `t2_engines.mjs` L381 calls `stateTaxAnnual` with `code: "GA"` as a parity fingerprint key; **`t10` §2E passes FL, AZ, MS, AL, MT and ZZ directly** |
| "`stateTaxAnnual` has zero dollar-exact coverage today … there is no house style to copy" | **`t10` §2E is thirteen-plus dollar-exact assertions on `stateTaxAnnual`**, each with its arithmetic written out longhand. It is exactly the house style |

`SCOPE_STATE_FIXTURES.md` §1 states it plainly: *"`t10` is not the gap. It drives `stateTaxAnnual`
directly across six archetypes, hand-verified to the dollar … The gap is that every archetype is a
structural branch, and AL's $6,000 exclusion carries no income limit — so D-3c has no assertion
anywhere in the suite."* That is correct and it is what this scope builds on.

**The brief also worried the L17 `stateCode: null` contract would have to break.** It does not. §2E
calls `g.stateTaxAnnual` **directly with explicit arguments** and never touches the portfolio, so it
sits outside that contract already. **No header edit is required and none should be made** — editing
it would make a true statement false.

> **The pattern, and it is the project instructions' own:** two documents that disagree will not
> notice. The brief restated its scope's conclusions instead of routing to them, and the restatement
> drifted. The scope was right for three days while the brief that pointed at it was wrong.

## 6. ⚠ FINDINGS — pool drift, and a stale figure in the repo

**A · The knowledge pool is one package behind in five files, not the two the brief warned of.**
`git clone` + content-hash comparison in both directions, §A2:

| File | Pool | Repo | Missing |
|---|---|---|---|
| `CHANGELOG.md` | `f9085cd3…` | `7fb82850…` | all five 2026-08-28 `## Unreleased` entries |
| `OPERATIONS.md` | `1697bf8a…` | `18768238…` | §I's `controls_state.sh` paragraph |
| **`t8_invariant.mjs`** | `5b826a10…` (180 L) | `de7e4d39…` (184 L) | **asserts 7 call sites; committed asserts 8 for v5.53's `_divLadder`** |
| `package_check.mjs` | `6218ec2d…` (340 L) | `0468b2e7…` (502 L) | §H provenance, §I scope-status, and their corrections |
| `package_check_controls.sh` | `57e4d1eb…` (146 L) | `69222804…` (261 L) | controls P20–P28 |

`qa/tools/controls_state.sh` is **absent from the pool entirely**. All five build inputs (§N) match.

The `t8` one is the **v5.30 shape**: a stale test that **fails against correct code and reads as a
regression**. The committed `t8` is green (38/38, run this session). Nothing is wrong with the app.

**B · `OPERATIONS.md` §E says the MC-parity guardrail is 9/9. It is 10/10, in the repo copy too.**
The fingerprint carries ten keys — `mc, extMC, stress, roth, rothCurrentEstate, rothAca, rothOther,
ssTable, stateTax, inflation` — printed from `/tmp/t2_v553_fingerprint.json`. §E is the section that
says *"Do not hardcode this count … The number has moved once and will move again if the fingerprint
gains a key."* It moved and §E did not. The manifest, CHANGELOG and `TESTING.md` all say 10/10.

**C · Run-folder setup is under-documented in one place.** `TESTING.md` L211–213 lists three copies;
`t31` additionally needs `METHODOLOGY.md` at the run-folder root. `TESTING.md` L5 and the qa-baseline
README both record it — the three-copy block does not. Five suites died at module load before the
copies were placed, and `t31` twice after. Import errors, not assertion failures, exactly as that
section warns.

**D · `stateTax` is a parity fingerprint key.** `t2` L381 calls `stateTaxAnnual({code:"GA", …})`.
Adding assertions to §2E cannot move it — §2E does not touch `t2` — but any future D-3c *fix* will
move `fp.stateTax` only if it changes GA, which it will not. Worth knowing before the repair lands.

## 7. Open decisions — Steve

> ⚠ **READ `docs/AUDIT_STATE_EXCL65_NOTES.md` §0 BEFORE RESOLVING THESE.** It post-dates this scope
> by hours and finds the **D-3c class mis-specified**: D-3c is defined as *"income-limited in law,
> applied unconditionally,"* and of the four defective states found, only New Jersey is
> income-limited. Maryland, Maine and Colorado reduce the exclusion by **Social Security received** —
> a mechanism nothing in this project models, and one `boundaries.mjs`'s `state_excl_limited` row
> cannot see. **None of that invalidates D3-a, D3-b or D3-c below** — the NJ case is still correct,
> still dollar-exact, and still worth building. It does mean the archetype this scope adds should be
> named and commented as **one mechanism of at least two**, not as *the* D-3c case.

**D3-a · Host. RECOMMEND: `t10` §2E, as D3 ratified.** Confirmed correct on the evidence above
rather than on the file-count reasoning D3 was ratified with. The finding in §5 gets recorded beside
D3 the way `SCOPE_CLAIM_EXPIRY_VERIFICATION.md` records its D-3 deviation — wrong reasoning and right
answer visible together.
*Alternative:* a new `t33_state_exact.mjs`. Rejected — it would duplicate 2E's harness and split the
state-module assertions across two files.

**D3-b · Does the case set assert the model, the statute, or both? RECOMMEND: both, with the model's
figures as `[KNOWN DEFECT]` pins per §D.** Four income points, each asserting the model's output to
the dollar; the NJ figures carried as sourced comments and asserted as *the gap*, so the pin says
what is wrong and by how much. When D-3c is fixed the pins flip and the fix is self-verifying.
*Alternative:* assert only the model's current output. Cheaper, but it records the behaviour without
recording that it is wrong — which is the thing worth keeping.

**D3-c · Gating.** §2E already carries a version-gated pin (`_v >= 529` for the Montana note). A
D-3c pin needs the same treatment or the frozen v5.52 leg will assert v5.53-era expectations.
Since no source changes here, the four figures are true on **both** legs and no gate is needed today
— but the pin's comment must say that the gate becomes necessary the moment D-3c is fixed. **Confirm
you want that written in rather than discovered later.**

**D3-d · NJ's `note` string is factually wrong, and correcting it is a source change.** The note says
"$75K/person"; [S1] says the MFJ maximum is **$100,000 for the household** and $75,000 is the
**single** figure. It also implies the limit is a single "~$150K" cliff when there are two phase-down
bands below it, and the model gates on 65 where NJ gates on 62. This is precisely the defect class
§2E's note scan was built to find, one level further out — the note contradicts the statute rather
than the code. **Out of scope here** (this scope's Shape field forbids source changes) and it would
require a version bump.

> ⚠ **SUPERSEDED SAME DAY — do not act on the recommendation this paragraph originally carried.**
> It recommended *"a separate, small release"* for NJ's note. `docs/AUDIT_STATE_EXCL65_NOTES.md`,
> written hours later, checked six of the nineteen `excl65` states against their revenue authorities
> and found **four wrong** — and found that **only NJ is income-limited at all**. Correcting NJ alone
> would now imply a review of the module that has not happened. **This decision routes to that audit
> and does not restate its conclusions**, because a second copy of an answer is what goes stale.
> — recorded rather than edited away, so the wrong recommendation and its correction stay visible
> together, the way `SCOPE_CLAIM_EXPIRY_VERIFICATION.md` records its D-3 deviation.

**D3-e · The pool refresh in §6 is a different job. RECOMMEND: cut it first and separately.** This
scope's package will itself touch `CHANGELOG.md`; stacking a correction on a stale base is how §H's
search window widened without anyone noticing. §6-B (`OPERATIONS.md` §E, 9/9 → 10/10) is a repo doc
fix and belongs in that same package.

## 8. Site census — what this touches

| File | Change |
|---|---|
| `qa/t10_taxcases.mjs` | **+1 archetype block inside §2E**, before the note scan. New assertions only; no existing line edited. The §2E summary line at L514 gains "six archetypes"; `pass2Ecount` needs no change (it is computed from the block boundary) |
| `CHANGELOG.md` | one `## Unreleased — qa/ only:` entry, house form, **in the same package** |
| `docs/SCOPE_STATE_FIXTURES.md` | Status row → RETIRED, at the ship, per §I; D3 resolved with the §5 finding recorded beside it; **D4 corrected** per the brief's §8B |
| `TESTING.md` | t10 count rolls; §6-C's run-folder note added to the three-copy block |

**Not touched:** `src/DangerClose.jsx` · `boundaries.mjs` · `households.mjs` · `t29_boundaries.mjs`
(F-6/F-7 already guard the census row and need no extension for this) · `METHODOLOGY.md` (no
modelling change) · the four in-app version sites (no bump — D4, corrected).

## 9. What would make this test worthless, and how it is prevented

- **Expected figures derived from the engine.** Prevented: every NJ figure comes from [S1]/[S2] and
  is cross-checked by two independent arithmetic methods that agree to the cent. The model figures
  are executed separately and compared.
- **A green reading from an empty set.** The $200,000 case is the only one where the model returns
  non-zero; if `STATE_RULES.NJ` were ever removed the archetype would silently take the fallback
  path. The case set must include an assertion that `R.NJ` exists and carries `excl65 > 0` — cheap,
  and it is the §9 pattern the brief names.
- **The pin outliving the defect.** D3-c above.
