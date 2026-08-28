# SCOPE — v5.36: the drawdown realizes capital gains (S-7, re-landed)

> ## ☑ RETIRED 2026-08-28 — BUILT AND SHIPPED AS **v5.36** (2026-08-16).
>
> **Do not build from this document.** The status line below reads *"ALL SEVEN DECISIONS RESOLVED —
> BUILD AUTHORISED"* and was true when written, on 2026-08-15, against shipped v5.35.
>
> Confirmed by content: `CHANGELOG.md` v5.36 — *"the drawdown realizes capital gains, and the tax
> engines consume them"* — describes this scope's subject, Engine D realizing gain on the spending
> sale (never on the sleeve RMD) with Engines B and C consuming the series. This scope is where the
> v5.34 engine work re-landed after that release narrowed; see `SCOPE_CAPGAINS_ENGINE_v5_34.md`.
> Body kept as the record of what was decided and why.
>
> *Retired 2026-08-28 by the second scope-retirement sweep. The first sweep (§I, 2026-08-26) found seven of nine stale; twelve had drifted again by v5.53. Confirmed by CONTENT against the release that shipped it — not by the presence of a version heading in the CHANGELOG, which is not evidence (see this file's note, and v5.34's).*

**Revision 3, 2026-08-15. ALL SEVEN DECISIONS RESOLVED — BUILD AUTHORISED.** Supersedes revisions 1
and 2. Revision 2 raised a seventh decision that revision 1 did not contain; it is resolved as **(b)**,
and the mitigation its resolution depended on has been **tested rather than assumed** — §5a.

**Against shipped v5.35** `a28843d3e1f441e90c765419264954ff` · **built** `2361b2ac3fe739d50526fd954b80fb63`
**Repo HEAD** `bec56f8` · **Prior build** v5.34 `db5efe3ccbdbacc05e7c76a8c31e74a0`

**Nothing has been edited.**

**Freshness (§A/§A2):** manifest = pool = committed tree at `a28843d3…`; built md5 agrees across the
manifest, `index.html` and the CHANGELOG provenance line. Clone-and-diff against `bec56f8`:
**47 content-matched, 34 knowledge-only, 0 drift.**

---

## 1 · Premise — the v5.34 plan's target is wrong at v5.35

`SCOPE_CAPGAINS_ENGINE_v5_34.md` §3a specifies S-7 as four hunks; hunk 7 — *"proportional gain on
draw"* — lands at `drawFromTaxable`. Correct against its v5.31 base. **Wrong at v5.35**, because
v5.35 made `drawFromTaxable` a sum of two things with opposite tax character (L4614, L4622):

| component | what it is | realizes capital gain? |
|---|---|---|
| `_sleeveRmdDraw` | required distribution from a **named IRA** under Other accounts | **No** — nothing sold; ordinary, already carried by `rmd_y` |
| `_spendFromTaxable` | the brokerage sale funding the spending shortfall | **Yes** — S-7's actual subject |

**Measured on shipped v5.35.** In any year `rmd_y ≥ drawNeeded` the spending need is zero, so
`drawFromTaxable` is provably sleeve RMD in its entirety:

| household | lifetime `drawFromTaxable` | provably IRA distribution | share |
|---|---|---|---|
| pension $120,000 | $2,372,361 | $2,369,613 | **99.9%** |
| pension $150,000 | $2,400,879 | $2,400,879 | **100.0%** |

A literal port computes capital gain on essentially all of it — the same defect class that caused
v5.34 to back S-7 out, but smaller, plausible-looking, and confined to one household shape.

**`_spendFromTaxable` is the complete set of Engine D sales — verified, not assumed.** The taxable
sleeve has exactly five mutations in `computeWithdrawalPlan`: init (L4459), sleeve RMD out (L4614),
spending draw out (L4622), surplus in (L4650), growth. There is no third outflow.

## 2 · Second premise correction — the pool is not homogeneous

`_taxInit` is `household − total401k` (L4459) and since v5.26 contains, in one number: brokerage,
Traditional IRAs, annuities **and HSA**. `_taxOrdInit` (L4460) exists because of that.
`realizeGain(sale, pool, basis)` (L481) applies one basis fraction to whatever pool it is handed;
handed this one it attributes capital gain to dollars that cannot produce any.

**Example household, measured:**

| | |
|---|---|
| whole pool | $147,000 |
| ordinary (trad + annuity) — Engine D **knows** this | $111,000 |
| HSA — Engine D does **not** know this | $15,000 |
| brokerage | $21,000 |

Excluding ordinary alone leaves a $36,000 gains-bearing base against a true $21,000 — **71.4%
overstated.** See §7.7.

## 3 · The partial — RECOVERED and verified

`DangerClose-CAPGAINS-PARTIAL.jsx` is back in the pool at `229191d697e3a1156128d2277c3d5601`,
matching the md5 the v5.34 scope records. All four hunk offsets land where §3a says: L4317,
L4425–4435, L4426/4477, L4500.

**Two corrections to the record, both measured:**

- **Its base is v5.31, not v5.32, despite its own version strings saying v5.32.** It carries
  `OBBBA_CONSTS` (v5.31) and has **no** `acaFloorYrs` / `acaBelowFloor` — the feature that defines
  v5.32. The version sites were bumped during the WIP ahead of the feature they name. **Do not use
  its version strings for anything.**
- **Its inline gain arithmetic IS `realizeGain`, exactly.** The partial predates the shared helper
  and has zero references to it, so a duplicate implementation looked likely. Tested over 200,000
  random cases plus the `pool = 0` edge: **zero mismatches.** `realizeGain` was extracted from this
  reasoning at v5.34, so hunk 7 becomes a two-line call rather than duplicated arithmetic — which
  matters, because duplicated expressions are this project's recurring failure (`diverge.cjs`).

**Still written fresh, per decision 1.** Its hunk 7 targets the wrong quantity and it knows nothing
of `_spendFromTaxable`, `_sleeveRmdDraw` or §2. Used as a **cross-check**, not a source.

## 4 · Sites — `qa/tools/census.cjs` against v5.35

| identifier | AST hits | note |
|---|---|---|
| `drawFromTaxable` | 10 / **9 sites** | L4605 · **L4614 sleeve RMD** · **L4622 spending** · L4637 `_taxBoy` · L4663 `_rmdShrink` · L4730–4731 row · L8374 render |
| `_spendFromTaxable` | **3** | the target |
| `_sleeveRmdDraw` | **5** | what must be excluded |
| `realizeGain` | 7 | reused, not rewritten |
| `taxableGainShare` | 1 decl, **0 call sites** | this release makes it non-zero; `t1` asserts 0 today and must flip |
| `_taxInit` | 8 / 6 | the heterogeneous pool |
| `rmdToTaxable` | 2 | enters at **full basis**, must keep doing so |
| `capGains_y` | 6 / 5 | Engine B's hardcoded `0` (L4940), `qdcg_y` (L4944), row (L5025), two render sites |

## 5 · The tracker convention — settled by decision 4

Three shares over one pool, one convention for all of them: **each fraction is measured on the pool
the draw actually comes out of.**

- The sleeve RMD leaves first and is **100% ordinary**. It reduces `taxOrd` (v5.35 already does this)
  and does **not** touch the gains-bearing share or `taxBasis` at all.
- The spending sale then draws from what remains. Its ordinary fraction and its basis fraction are
  both measured on the **post-sleeve-RMD** pool.

This is decision 4's real content: S-7 has to answer *"measured on which pool, at which point"* for
`_basisFrac` anyway, and answering it differently from `_ordFrac` in adjacent lines is the defect.
**`_ordFrac` moves in the optimistic direction** — removing the same amount from numerator and
denominator lowers the fraction — which must be disclosed rather than buried.

## 5a · The HSA plumbing — design, and the mitigation TESTED not assumed

**The new share.** `retireStartBalances` gains one key, `othHsa`, computed alongside the existing
shares from the same `otherAccounts` rows. **A single total, not per-owner** — the existing shares are
split A/B because they feed per-person RMD ages; HSA generates no RMD and Engine D needs only the
amount to exclude. Following the idiom where it applies and not where it does not.

**Engine D consumes it once:**

```
gains-bearing pool = max(0, _taxInit − _taxOrdInit − _hsaInit)
```

clamped the same way `taxOrd` already is (`Math.min(_taxOrdInit, _taxInit)`, L4504), because a
user-entered `household` can be smaller than the parts.

### The risk, and the test that discharged it

`retireStartBalances` has **10 AST hits — the declaration and 9 consumers** — and **four of them
spread the whole object** (L5168, L9026, L9172, L10312), each building a **P object for Engine A**.
An added key lands inside those P objects. If anything iterated or serialised them, "purely additive"
would be false and parity would move.

**Verified two ways, on the shipped source:**

- **No engine iterates P's keys.** No `Object.keys(P)`, `Object.entries(P)`, `for…in`, or
  `JSON.stringify(P)` anywhere in the file.
- **Measured.** A dummy key `__probeAdditiveKey` was inserted into `retireStartBalances`, the harness
  rebuilt, and the suite re-run: **parity 9/9 strict**, and `t1` 93 · `t3` 36 · `t7` 41 · `t8` 38 ·
  `t13` 42 · `t17` 63 · `t18` 50 · `t19` 32 · `t20` 94 — **every figure identical.** The probe was
  reverted and the source hash re-verified at `a28843d3…`.

**So the additive claim is a measured fact, not a hope.** It still gets a negative control in the
build (§6): the point of the probe was to establish that adding a key is inert, which means an
assertion about the NEW share must discriminate on the share's *value*, not on its presence.

## 6 · Tests

**Ships with:**

- `t19`'s four v5.34 extinction assertions **inverted** (L156, L157, L161, L163) — the fix verifying
  itself. ⚠ **The v5.35 extinction set must NOT move** (`totalToWithdraw`, the RMD sourcing set). If
  it does, S-7 has reached into the sequencer — **stop and narrow** (§E).
- **The discriminating case this release exists for:** a household with a named IRA under Other
  accounts *and* a spending draw, asserting **`capGain_y === 0` in every year the RMD covers the
  spending need.** This is what fails on a literal port. `t19`'s split-RMD household already exists.
- Gain on a genuine sale, hand-computed to the dollar, on a household with **no** Other accounts so
  §2 cannot confound it.
- `rmdToTaxable` enters at full basis — surplus is already-taxed and must not create gain later.
- Basis conservation: never exceeds its pool, never negative, falls only on sale.
- `t1`'s `taxableGainShare` zero-call-site assertion flips.

**Negative controls (§B2) — budget for them properly.** v5.35 ran five and **three did not fire on
the first pass**, hiding −18% ending wealth and +25% lifetime MAGI. At minimum: gain pointed at
`drawFromTaxable`; the §2 share removed; Engine B's `capGains_y` reverted; Engine C's MAGI term
reverted; `_ordFrac` reverted to the pre-sleeve pool. **Measure that each patch moves engine output
before calling a control uncovered.**

**Parity is the gate.** The shipped default is 0, so at the default no figure should move. S-7 touches
Engine D and Engine B/C consumption — none of which parity covers — so **parity must hold 9/9
strict**, proving Engine A untouched. If parity moves, the fix has overreached.

## 7 · Decisions

### RESOLVED (maintainer, 2026-08-15)

1. **The partial is recovered** (§3) — **write S-7 fresh, use the partial as cross-check only.** ✅
2. **Target is `_spendFromTaxable`**, not `drawFromTaxable`. ✅
3. **Gain applies only to the non-ordinary share** of the Priority-1 pool. ✅ — but see 7 below.
4. **The `_ordFrac` question is settled IN this release**, on the convention in §5. ✅
5. **The ACA-premium sale's gain is OUT — v5.37.** ✅ *(Revision 1 recommended "in". That was wrong:
   `acaSaleGain` lives in `runRothStrategies` — Engine A — which `t2` calls for its parity
   fingerprint. Bundling it forfeits the 9/9-strict guarantee that Engine A is untouched, on a
   release already carrying two premise corrections.)*
6. **Ship alone**, not with S-8. ✅

### 7. RESOLVED — the gains-bearing pool EXCLUDES HSA, via a new share on `retireStartBalances`

Decision 3 said *"non-ordinary, non-HSA"*. **Engine D could not express that.**
`retireStartBalances` returned `othOrdA, othOrdB, othRmdA, othRmdB` and no HSA share;
`otherTaxableInit()` lumps `taxable` and `hsa` together; Engine D's body contains **zero** HSA
references.

| option | gains-bearing pool | example household | |
|---|---|---|---|
| (a) exclude ordinary only | `_taxInit − taxOrd` | **$36,000** vs a true $21,000 — **71.4% overstated** | rejected |
| **(b) exclude ordinary and HSA** | needs a new share | $21,000 — correct | ✅ **taken** |

71.4% is too large to accept, and the conservative-default rule applies where an assumption *must* be
picked — here it need not be, the data is in `otherAccounts`. HSA money is tax-free on qualified
withdrawal, so attributing capital gain to it is not a simplification, it is wrong.

## 8 · Out of scope

- The sequencer. Its extinction set must stay green.
- **S-8** (`rothGainPct` initialisation) — different surface, different quantity; the v5.34 scope
  warns against conflating them.
- **The ACA-premium sale's gain** — v5.37, per decision 5.
- **Moving the default off 0.** No positive evidence exists; the v5.32 scope disowns the only
  evidence pointing that way.
- Engine D applying no tax to balances. Unchanged, disclosed.

## 9 · One copy item this release creates

The control reads *"Embedded gain, % of taxable pool."* Given §2's composition, that label is already
ambiguous — and v5.36 is the release that finally consumes the number. It needs a copy pass with a
`t4` assertion, in this release.

---

*Every line number, site count and figure in §1–§5 was read or measured from `DangerClose-v5_35.jsx`
in this session. Where the v5.34 scope disagrees it is corrected above rather than followed.*
