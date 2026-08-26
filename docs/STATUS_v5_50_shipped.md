# STATUS — v5.50 shipped (2026-08-26)

**Disclosure only.** No engine change; no number the model computes moved. Parity **10/10**, DOM diff
STRICT **32**.

| Field | Value |
|---|---|
| Version | **v5.50** |
| `src/DangerClose.jsx` md5 | `0bef5fc4cb1ebdaf1effffe1783bbd04` |
| Built `index.html` md5 | `c361f4ea99a061017cbc0d6a27011fe2` |
| Built from | v5.49 `2ccc62b669f6ee52c6a0be1709c967a5`, repo `9b8dbe8` |
| Scope | `SCOPE_D7_ESTATE_DISCLOSURE.md` — **retired at this ship** |
| Suite | **2,585 app checks / 0 failing** · tooling 82 · **2,667 total** · `smoke_built` 16/16 |

---

## 1. What shipped

The comparator's estate figure deducts no estate or inheritance tax of any kind — `HEIR_RATE` (0.22)
is an heir *income* tax on Traditional balances only — while being both the **default ranking
objective** and labelled *"MAX AFTER-TAX ESTATE."* Neither user surface disclosed this, and the one
piece of estate-limitation text in the app was gated to single households, so a couple never saw it.

v5.50 narrows the label to **`MAX ESTATE AFTER HEIR INCOME TAX`**, narrows the noun and every site
that carried the old phrase, and adds the limitation to the comparator note, the Field Manual (twice
— beside the objective list and in its §13 register), and `METHODOLOGY.md` §12. No state, threshold
or dollar figure appears anywhere in the shipped copy, by decision.

## 2. Three findings, all from the suite rather than from reading

**2.1 · The census listed 2 of 5 sites, and case-sensitivity is why.** The scope's §3 named L9485 and
L9518. Also carrying `after-tax estate`: **L9412** (comparator description, in the *same bordered
card* as L9485), the **Field Manual objective list**, and **L9460** — the results-table **column
header**, the heading directly above the ranked figure and the most prominent site of the five.

The header was found by the new `t4` extinction check on its first run. It reads `After-tax estate`
with a capital A, and the census greps in the scope *and* in the build session were case-sensitive.
Every D-7 pin added this release matches **case-insensitively**, so that blind spot cannot recur.

> **A census is a claim about absence, and absence is the one thing a table cannot show you.** Each
> of §3's rows was individually correct; re-checking them would never have surfaced what it omitted.
> Re-resolve a census by **re-running the search**, not by confirming its entries.

**2.2 · `t31` said the disclosure was already present at v5.49 — for two wrong reasons.** `inApp` is
a source-text search and cannot see JSX gating, so the single-household-gated card satisfied it; and
`METHODOLOGY.md` is one shared file at the run-folder root, so a frozen leg is read against the
*current* document. Under one shared `POST` gate the v549 leg went green on v5.50's expectation, and
the **v548 leg failed outright, invisibly**, because `runsuite.sh` only runs `t31` for the prior and
current tags. Keys are now gated **per key** to the release that landed them, and the pre-v5.50 pin
asserts what was actually true of those builds: the Field Manual never named it.

**2.3 · `dom_entry_v592.jsx` is not a stray and must not be deleted.** It was proposed for deletion
at this build as a suspected fat-fingered `v549`. It is the **retired v5.9.2 leg**, still registered
in four `KNOWN_VERSIONS` arrays and kept deliberately per the qa-baseline README so a retired leg can
be run from a locally-supplied source. The recommendation to delete it was made from a guess and
withdrawn; reading `KNOWN_VERSIONS` is what caught it.

## 3. Tests

Prior leg (v5.49) **943** · current leg (v5.50) **964** · parity **10/10** · feature run once **668**
= **2,585 app checks, 0 failing**. Tooling **82**. **2,667 total.** Totals from suite output.

- `t1` **+10** — STATIC pins on every narrowed string, plus a case-insensitive invariant that
  `after-tax estate` appears **nowhere** in the source. Negative-controlled: reverting one string
  gives 163/2.
- `t4` **+8** — the disclosure rendered by a **couple**, gated on a `!P.single`-only witness in the
  same paragraph, so the check cannot go vacuous. This is the assertion doing the real work; `t31`
  cannot see household gating.
- `t31` **+3 (current leg)** — third key `estate tax`, plus both surfaces asserted separately because
  the parity predicate is an OR and the app arm was already satisfied before the fix.

**Negative control, recorded:** with the version bump and no copy, `t31` reported **13 passed / 2
failed**. A key added to a list that is already satisfied proves nothing.

## 4. What this release does not fix

The estate figure remains **wrong for affected households**; it is now disclosed as wrong. `HEIR_RATE`
is unchanged, the default objective is still `estate`, and no estate tax is modelled — all three are
separate questions and were explicitly out of scope.

## 5. Still open

- `deep_test.jsx` crashes in `validation/` — selectors need re-deriving against a current build.
- The `/bucket|glide/i` forbidden-term hits — a product-vocabulary call for Steve.
- The 12,151-line file's structure review — Section E's last unreached item, unscoped.
- One call made without asking, flagged rather than buried: the narrowed label **keeps** its
  `(leave the most behind)` gloss. All three objectives carry one, the gloss makes no tax claim, and
  dropping it from only this one would break the pattern. Trivially reversible.
