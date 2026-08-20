# DERIVATION — Roth tab RMD term, expected figures before any code

| Field | Value |
|---|---|
| For | `SCOPE_FIX_roth_tab_rmd_magi.md`, decisions resolved 2026-08-20 |
| Build | **v5.40** · md5 `6b7cebb1476ee66e57079b713b94ba75` |
| Order | Derivation **before** implementation, per the v5.37 / v5.38 precedent |
| Status | Derived and cross-checked. **No `src/` change made.** The build has not started |

---

## 1. The rules this derivation applies

**Primary sources**, verified 2026-08-20 and unchanged from the measurement:

- **RMD amount** — IRS Pub. 590-B App. B Table III (Uniform Lifetime). The divisor applies to the
  **prior 31 December balance**, divided by the divisor for the age *attained in the distribution
  year*.
- **RMD applicable age** — SECURE 2.0 §107: 73 for births 1951–1959, **75 for 1960+**.
- **Taxable Social Security** — 26 U.S.C. §86, full two-tier worksheet.
- **What belongs in IRMAA MAGI** — 42 U.S.C. §1395r(i)(4)(A): AGI + tax-exempt interest. A required
  distribution is a taxable IRA distribution and is therefore in AGI.

**Modelling decisions**, as resolved in the scope §6:

- **D-1** grow-then-convert (the ladder loop's recursion, the one rendered at L9021).
- **D-2** Option C — per-person balances, RMD leaves the account, `_perRmd` reads the loop.
- **D-3** conversion capped at `grownTrad − rmd`, matching Engine C L4393.
- **D-4** RMD term only; the SS cliff and `div_y`/`capGain_y` are separate releases.

---

## 2. ⚠ The RMD basis error this derivation caught

The first attempt at the D-3 sweep divided the **already-grown** balance (`gA = a × 1.045`) rather
than the prior 31 December balance. Pub. 590-B is explicit that the basis is the prior year-end
figure. **The error inflates every RMD by a factor of `(1 + g)` — 4.5% here.**

It is recorded because it is silent: the figures stay plausible, the ladder still runs, and nothing
throws. It was caught only by the derived MAGI failing to reproduce the measurement's independently
computed $167,131. **Whoever implements this must assert the basis, not just the divisor** — a test
that checks `rmdDivisor(75) === 24.6` passes happily against the wrong balance.

---

## 3. Derived expectations — shipped example household

`dobA` **1964-01-01** (from `MASTER_PROMPT` L151 via `_parseDOB`, **not** the L641 fallback),
`dobB` 1966-01-01, retire 2029, slider at its $70,000 default. Ladder 2029–2040. Spouse A attains 75
in 2039, so the RMD tail is **2039–2040**.

| Year | RMD | Conv | taxableSS (§86) | **MAGI post-fix** | MAGI today | Delta |
|---|---|---|---|---|---|---|
| 2031–2038 | $0 | $70,000 | $46,920 | $122,140 | $121,720 | +$420 |
| **2039** | **$44,991** | $70,000 | $46,920 | **$167,131** | $121,720 | **+$45,411** |
| **2040** | **$44,410** | $70,000 | $46,920 | **$166,550** | $121,720 | **+$44,830** |

The +$420 in non-RMD years is the dividend term, which arrives with the *later* `div_y` release, not
this one. **Under this release those years must not move at all** — see §5.

⚠ **Do not use this table's 2029–2030 rows.** The derivation script omits `spouseBWorkTaper`
(20,000 / 18,000 / 15,000 in ladder years 0–2), so the first three years are understated by that
amount. The taper is zero by 2039, so the tail-year targets — the only ones that become assertions —
are unaffected. Flagged rather than silently corrected, because a partially-wrong table that looks
whole is exactly what this project keeps getting caught by.

### Cross-check

These figures were produced by a script written independently of `ladder_hand.mjs` and reproduce its
$167,131 / $166,550 **exactly**. Engine C, driven separately, gives $166,103 / $165,289 — 0.7% apart,
explained by Engine C tracking its own Traditional balance. Three computations, two of them
independent, agreeing on the term that carries the finding.

---

## 4. The assertions this release ships

1. **`t1` structural (mirrors the existing `STRUCT S-1` at L291–307, which pins Engine C's term set
   and leaves the Roth tab's unpinned):** the Roth-tab `magi` sums exactly its registered term set,
   order-insensitive, AST-resolved, **gated to the builds it is true for.**
2. **Tail-year dollar-exact:** 2039 RMD $44,991 and MAGI $167,131; 2040 RMD $44,410 and MAGI
   $166,550. Hand-derived above, before the code exists.
3. **RMD basis:** the distribution divides the **prior year-end** balance. §2's error must not be
   re-introducible without a red test.
4. **Recursion unification (D-2 Option C):** the ladder table's `tradBal` and the RMD cards' balance
   agree for **every** ladder year. Today they diverge to $48,712 (3.78%) by 2040; this is that
   defect's extinction invariant.
5. **Non-RMD years are unmoved:** 2031–2038 MAGI stays $121,720. This is what keeps the release
   honest about being the RMD term *only* — if those years move, something else came along with it.

**Negative controls are mandatory (OPERATIONS §B2).** Perturb the RMD term, the basis, and the
recursion, and confirm each check fires. **If a control does not fire, that is the finding** — do not
adjust the control until it does.

---

## 5. What moves for the user, and what the CHANGELOG must say

An RMD is ordinary income, so it enters `nonSSincome` (the §86 base) and `grossTaxable` as well as
`magi`. **The tab's conversion tax, marginal rate and 24%-bracket headroom will rise** for any
household whose ladder runs past its RMD age. That is a correction, not a regression, and the release
notes must say so plainly rather than let a user discover their tax figures moved.

The RMD cards will also change, because D-1 adopts the higher (conservative) balance.

**IRMAA tier verdicts do not change on the shipped example household** — $167,131 against a rendered
threshold of $293K in 2039. They *do* change on a household with a large taxable sleeve, but through
the `div_y`/`capGain_y` terms, which are not in this release.

---

## 6. Not done

The build. This is the derivation only: expected figures fixed in advance so the implementation is
checked against them rather than the reverse. Remaining: the `src/` edit, four version sites, the five
assertions above with negative controls, full suite green, parity 8/8 (a break there means the fix
overreached — stop, do not update the expectation), METHODOLOGY, CHANGELOG, `index.html` build and
`smoke_built.mjs` at 16/16.
