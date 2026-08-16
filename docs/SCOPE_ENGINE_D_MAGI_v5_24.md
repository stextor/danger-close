# SCOPE — release (b), Engine D `magi` + the false copy

**Status: BUILD GATE OPEN. §7 decisions RESOLVED 2026-08-11 (Option 3 · blunt · METHODOLOGY yes).**
The premise as carried forward does **not** hold — §1 — and the release is re-scoped accordingly.
No source has been changed by this document.

| Field | Value |
|---|---|
| Date | 2026-08-11 |
| Current build | **v5.23** · `bce4bd537a498df5b489ea5702e3eb44` (verified against the committed tree at HEAD `b28de44`) |
| Governing parent | `SCOPE_FIX_otherAccounts_tax_treatment_v5_21.md` rev 2, §4 site 9, §7 D-7 |
| Version | **v5.24** — disclosure-only; no engine touched |
| Method | Every line number and site count below resolved by acorn AST walk (`qa/tools/census.cjs`). No greps. Household figures computed from the parsed `DEFAULT_PORTFOLIO`, not restated. |

---

## 1. ⚠ The premise is wrong as carried forward

The carry-forward, and `t19`'s B-2 pin, describe the defect as:

> *"Engine D `magi` omits `drawFromTaxable`"* — and by implication, release (b) fixes it by adding
> `drawFromTaxable` to `magi`.

**The factual half is true. The implied fix is wrong, and would introduce a defect.**

`drawFromTaxable` is a withdrawal from a taxable brokerage account. Such a withdrawal is *not* income.
It is mostly return of basis; only the realized gain is taxable, and at preferential LTCG rates rather
than ordinary. Adding the full draw to MAGI would tax returned principal as ordinary income, inflating
MAGI, the bracket, and everything keyed to them.

**The source already says so, at the line.** v5.23 L4161–4162:

```js
// Conversion adds to MAGI. RMD and tradDraw are also taxable. Taxable-account draws are not (only gains are, ignored here).
const magi = taxableSS + pen_y + work_y + streamsOrd_y + rmd_y + tradDraw + conv_y; // tax-free streams excluded
```

**And Engine B agrees.** `computeTaxPlan` L4373: `const capGains_y = 0;` — *"conservatively 0 unless a
sale is modeled."* Neither engine models realized gains. That is a disclosed simplification, applied
consistently, not a defect.

So the omission is **deliberate, documented, correct, and cross-engine consistent.**

## 2. What the actual defect is

Not the `magi` expression. The **classification** feeding it.

v5.23 L4003: `const _taxInit = Math.max(0, PORTFOLIO.household - PORTFOLIO.total401k);`

Every dollar of `otherAccounts` lands in the pot Engine D treats as already-taxed brokerage. On the
shipped example household, computed from the parsed literal:

| Component | Amount |
|---|---|
| Rollover IRA (A) + Traditional IRA (A) | **$90,000** |
| Spouse B annuity + state plan | **$21,000** |
| Genuinely taxable brokerage | $21,000 |
| HSA (held **out** of the tax split per the v5.10 `contribAccrual` decision) | $15,000 |
| **Total `otherAccounts`** | **$147,000** |

**$111,000 — 76% of the pot — is not already-taxed money.** It is drawn first, spent entirely
tax-free, generates no RMD, and its growth is untaxed.

Direction: this makes the plan look **better** than it is. For an app whose stated identity is
deliberate pessimism, that is the wrong way to be wrong.

## 3. Why release (b) cannot be built before release (c)

The parent scope's own census states site 9 **conditionally** — and the conditional is load-bearing:

> | 9 | **Engine D `magi`** | 7686 | **If these dollars become trad, they must enter MAGI and RMD** |

They become traditional in **release (c)** — "fold and classify." Until that lands there is nothing
legitimate to add to MAGI, because under today's classification the pot genuinely *is* modelled as
taxable brokerage, and taxable-brokerage draws correctly stay out.

**The (b) → (c) ordering inverts the dependency.** The MAGI change is not a prerequisite of the
classification; it is a *consequence* of it. This is a scope-shape error in the parent document, not a
new finding about the code.

## 4. What *is* independently shippable now — the false copy

Two user-facing statements are false **today**, under today's modelling, and can be corrected without
touching an engine.

| # | Site | v5.23 lines | What is false |
|---|---|---|---|
| 1 | Withdrawal tab, Priority 1 panel | **L7849–7851** | Labels the $147K pot *"Emergency Fund and any after-tax / taxable brokerage"* and *"Already-taxed principal. Only the gains are taxed (long-term cap gains: 0% / 15% / 20%)."* Both halves are false: 76% is not already-taxed, and **no** gains are taxed — Engine D applies no LTCG anywhere |
| 2 | Field Manual, `DOCS_HTML` | one-line blob | Describes other accounts as *"non-retirement"*, which the named IRAs and state plan are not |

This is the project's own standard: *simplifications are disclosed in-app, never silent.* Right now the
simplification is not merely undisclosed, it is contradicted in two places.

## 5. Site census (AST-resolved, v5.23 lines)

`drawFromTaxable` — **9 hits**, all inside `computeWithdrawalPlan@3964` except the renderer:
L4114 (declaration), L4116 (×3, the draw), L4175 (×2, row emit), L4176 (`totalDraw`), L7807 (×2, renderer).

`_taxInit` — **7 hits**: L4003 (definition), L4044 (`let taxable = _taxInit`), L4191 (×2, return), L7741 (×2, destructure), **L7849 (the false copy)**.

Under the §7 Option 3 recommendation, exactly **one** of these sites changes: L7849–7851. Plus the
`DOCS_HTML` line. No engine site is touched.

## 6. Tests this ships with

**Under Option 3 (copy-only):**

- Parity **8/8 strict** and all **770** checks returning identical figures — the entire proof, same
  shape as v5.22 and v5.23.
- `t19` B-2 pin: its assertion still passes (the `magi` expression is unchanged) but **its comment is
  corrected** — see §8. A pin that mislabels its own defect is worse than no pin, because the next
  session builds what the pin says.
- New `t4` DOM assertions on the corrected copy, so the false wording cannot return — extinction-style,
  the shape `t8` uses.
- `qa/domdiff_withdrawal.mjs` re-pointed to the v5.23 → v5.24 pair, expected to show **only** the
  copy block and the version string as divergent.

**Explicitly NOT in this release:** any change to `magi`, `_taxInit`, `_tradInit`, RMD, or the draw
order. Those are release (c).

## 7. DECISIONS — RESOLVED 2026-08-11, build gate OPEN

**D-1 · Release shape.** The parent plan's (b) → (c) split does not survive §3.

- **Option 1 — Reorder.** Do (c) first, then the MAGI/RMD consequences as (b). Correct dependency
  order, but (c) is the large one and this front-loads it.
- **Option 2 — Merge.** (b) and (c) become one release. Honest about the coupling; loses the
  independently-verifiable property that made the three-way split attractive.
- **Option 3 — Re-scope (b) as disclosure-only.** ✅ **CHOSEN.** Fix the two false statements now;
  leave all modelling to (c), which then does classification + MAGI + RMD as one coherent unit.

  *Why:* users are reading a false statement today and the fix is cheap and parity-provable. It keeps
  three independently verifiable releases. It leaves the modelling change as one unit rather than a
  split that §3 shows cannot actually be split. And it ships the conservative direction first — telling
  people the tool is optimistic here, before the tool stops being optimistic.

**D-2 · How blunt should the corrected copy be?** ✅ **RESOLVED: blunt.** It must stop claiming
"already-taxed principal," **and** state the consequence plainly — *"this pot is currently spent tax-free and
generates no RMD, which makes the plan look better than it is; a future release will fix this"* — or
limits itself to accurate description without the self-criticism. Recommend the blunt version; it
matches the app's disclosed-limitations voice, and the understatement is material at 76% of the pot.

**D-3 · Does the corrected copy need a matching METHODOLOGY note?** ✅ **RESOLVED: yes.** A §12 line
lands with this release. Treated as a *disclosure* change, not a modelling change — the convention that
METHODOLOGY updates only for modelling changes is about not churning it on presentation releases, and a
release whose entire purpose is disclosing a limitation is squarely what §12 exists for.

### Build instruction, as resolved

The release changes **exactly three content sites plus the four version sites**:

1. **L7849–7851** — Withdrawal tab Priority 1 panel. Stop calling the pot already-taxed principal.
   State, in the app's own disclosed-limitations voice: what the pot actually contains, that it is
   currently spent tax-free and generates no RMD, that **this makes the plan look better than it is**,
   and that a future release fixes it. Blunt, per D-2.
2. **`DOCS_HTML`** — the Field Manual "non-retirement" description. Same correction, shorter. Use
   quote-free anchors; the blob is one line and holds two of the four version sites.
3. **METHODOLOGY §12** — one limitation entry, per D-3.
4. Version bump ×4: footer, DATA LOAD header, Field Manual callsign, Field Manual footer.

**No engine site is touched.** If a build step appears to require editing `magi`, `_taxInit`,
`_tradInit`, the draw order or any RMD path, that is evidence the scope premise has failed again —
**STOP and report**, do not adapt.

## 8. Correction owed to `t19` regardless of which option is chosen

`qa/t19_engineD_exact.mjs` L80–86 currently reads:

```
// ── B-2 · draws from that pot contribute NOTHING to MAGI.
// RELEASE (b) FIXES THIS — this assertion must then FAIL and be replaced.
ck("[KNOWN DEFECT 2026-08-11 | rel b] Engine D magi omits drawFromTaxable", ...)
```

Per §D pin discipline a pin must name *what is wrong*. This one names something that is **right**.
Left alone, it instructs the next session to add `drawFromTaxable` to `magi` — the §1 defect. It should
be re-tagged `| rel c` and reworded: the defect is that the pot is misclassified, so money that ought
to be traditional never enters MAGI *as `tradDraw`*. The assertion itself can stand; only its label and
comment are wrong.

This correction is the third time a statement of this finding has had to be fixed — the parent scope's
§1 records two earlier ones, and `t19`'s own B-3 note records a fourth on the adjacent pin. The finding
is unusually good at being restated wrongly, which is itself worth carrying forward.

## 9. Honesty statement

No source file was modified. The v5.23 tree hashes identical to the committed one. Every claim about
Engine D's behaviour was read at the line in the committed source; the household composition was
computed from the parsed literal. **Not executed:** nothing in §6 has been written or run — no test
exists for the corrected copy, and the domdiff re-point is proposed, not proven.
