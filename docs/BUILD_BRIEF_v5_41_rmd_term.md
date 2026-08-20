# BUILD BRIEF — v5.41, the Roth tab's omitted RMD term

**Read this first, then `OPERATIONS.md` §A. Do not start editing until the freshness check is stated.**

| Field | Value |
|---|---|
| Written | 2026-08-20, at the end of the scoping session |
| Target | **v5.41** (bump from v5.40) |
| Base source | `src/DangerClose.jsx` md5 **`6b7cebb1476ee66e57079b713b94ba75`** |
| Kind | Modelling fix. `src/` change · version bump · new extinction invariants · METHODOLOGY update |
| Decisions | **All four resolved.** Nothing is waiting on Steve |
| Expected figures | **Already derived.** Do not recompute them to match the code — check the code against them |

---

## 1. Freshness check (OPERATIONS §A / §A2) — do this before anything

1. `PROJECT_KNOWLEDGE_INDEX.md` names the current build. It should say v5.40. **⚠ It has been stale
   before** — it read v5.39 for a day after v5.40 shipped. Cross-check against `CHANGELOG.md`.
2. `md5sum` the current `.jsx` against the manifest.
3. **Clone and diff the suite, both directions** (§A2). Not optional.

**Expected state as committed 2026-08-20** — if any of these differ, something moved after this brief
was written and you should find out what before proceeding:

| File | md5 |
|---|---|
| `src/DangerClose.jsx` | `6b7cebb1476ee66e57079b713b94ba75` |
| `docs/SCOPE_FIX_roth_tab_rmd_magi.md` | `cd45a611b2b3264597764535032eee22` |
| `docs/DERIVATION_roth_tab_rmd_magi.md` | `7a374922936d917894d6f8268ac2e831` |
| `docs/MEASUREMENT_roth_tab_magi_v5_40.md` | `0df8aa77c64274217203eeff84bd80ba` |
| `qa/tools/ladder_hand.mjs` | `590234628df6a96e84dd3223a54fe2f3` |
| `qa/tools/hand_86.mjs` | `ad9688928e9a897b62951e5e22ba280e` |
| `qa/tools/derive_rmd_expectations.mjs` | `0cfa92b929735f5207eab517c9b7adfb` |
| `qa/tools/render_check.mjs` | `88711e45ca98e8e63599488699ceeca3` |

The manifest's hash table does **not** yet carry rows for the eight `qa/tools/*.mjs` files added
across the last two sessions. Add them at the post-ship refresh.

---

## 2. Read, in this order

1. `docs/SCOPE_FIX_roth_tab_rmd_magi.md` — the scope. §6 decisions are all resolved.
2. `docs/DERIVATION_roth_tab_rmd_magi.md` — the expected figures, fixed before code exists.
3. `docs/MEASUREMENT_roth_tab_magi_v5_40.md` rev 2 — the evidence, if you want the why.

`STOP-REPORT-v5_40-roth-tab-section86.md` is superseded on its direction claim and kept as history.
Don't build from it.

---

## 3. What to change

**Three sites, one block** — `<anon>@8719 < DangerCloseMain@5217`, the Roth tab's ladder loop.
Line numbers are v5.40's; **re-find them with `qa/tools/funcmap.cjs`, don't trust them.**

| Line | Today | After |
|---|---|---|
| L8832 | `nonSSincome = pension + spouseBWork + conv_y` | **+ `rmd_y`** — the §86 provisional base |
| L8847 | `magi = pension + spouseBWork + taxableSS + conv_y` | **+ `rmd_y`** — the target |
| L8850 | `grossTaxable = ` same expression | **+ `rmd_y`** — an RMD is ordinary income |

Plus the loop must track **per-person** balances and let the RMD leave the account, and `_perRmd`
(L8906–8940) must read those balances instead of replaying its own.

**Resolved decisions, do not re-litigate:**

- **D-1 — grow-then-convert.** The ladder loop's recursion (L8814/L8888), which is the one rendered
  at L9021 and the conservative one. `_perRmd`'s convert-then-grow is retired.
- **D-2 — Option C.** Unify the two recursions. They currently diverge to **$48,712 (3.78%)** by 2040
  and both are on screen.
- **D-3 — cap the conversion at `grownTrad − rmd`**, matching Engine C L4393. Measured cost: worst
  case **$252** across the whole slider range; $0 on both measured households.
- **D-4 — RMD term only.** The SS cliff and `div_y`/`capGain_y` are separate releases.

**Version bump touches four in-app sites:** footer, DATA LOAD header, Field Manual callsign, Field
Manual footer. `t1`'s STATIC checks assert these, so a stale one fails loudly.

---

## 4. The numbers to hit

Shipped example household, slider at its $70,000 default. **`dobA` is 1964-01-01** — from
`MASTER_PROMPT` L151 via `_parseDOB`, **not** the L641 fallback. Resolve DOBs through `PLAN_TIMELINE`,
never from the literal. Spouse A attains 75 in 2039, so the tail is **2039–2040, two years**.

| Year | RMD | MAGI after | MAGI today | Delta |
|---|---|---|---|---|
| 2031–2038 | $0 | **$121,720 — unchanged** | $121,720 | $0 |
| **2039** | **$44,991** | **$167,131** | $121,720 | +$45,411 |
| **2040** | **$44,410** | **$166,550** | $121,720 | +$44,830 |

Cross-checked three ways: two independently-written scripts agree exactly; Engine C gives
$166,103 / $165,289, 0.7% apart (it tracks its own Traditional balance).

**If the code disagrees with this table, the code is wrong until proven otherwise.** Adjudicate by
reading the primary source, and record which one was wrong.

---

## 5. What ships with it

1. **`t1` structural invariant** mirroring the existing `STRUCT S-1` block (L291–307), which pins
   **Engine C's** MAGI term set by AST and leaves the Roth tab's unpinned — that gap is why this
   defect survived. Assert the Roth-tab `magi` term set exactly, order-insensitive, **gated per leg**
   (OPERATIONS §B2: do not apply the new expectation to frozen builds).
2. **Tail-year dollar-exact assertions** — the §4 table.
3. **RMD basis assertion** — the divisor applies to the **prior 31 December** balance. See §7; a test
   asserting `rmdDivisor(75) === 24.6` passes happily against the wrong balance.
4. **Recursion-unification invariant** — ladder `tradBal` and the RMD cards agree every ladder year.
5. **Non-RMD years unmoved** — 2031–2038 stay $121,720. This is what keeps the release honest about
   being the RMD term only.

**Negative controls are mandatory.** Perturb the term, the basis, and the recursion; confirm each
check fires. **If a control doesn't fire, that is the finding** — investigate, don't adjust the
control until it goes red.

---

## 6. Ship ritual

Full suite green · **parity 8/8** · METHODOLOGY updated (this changes modelling) · CHANGELOG with
per-suite counts *parsed from suite output, never restated from memory* · `index.html` rebuilt via
Vite (copy the config to `vite.config.js`, **with the dot**) · `smoke_built.mjs` **16/16** · four
version strings present exactly once, zero stale v5.40 strings.

**Parity covers `runRothStrategies` (L3683), a different function from this render block. It should
stay 8/8. If it breaks, the fix overreached — stop and narrow it, do not update the expectation.**

**The CHANGELOG must disclose that conversion tax, marginal rate and headroom rise** for any
household whose ladder runs past its RMD age, and that the RMD cards move because D-1 adopts the
higher balance. Users will notice; say why. No reporter names.

---

## 7. Traps, including three I fell into

**Mine, all from the last two sessions:**

- **`dobA` is 1964, not the L641 fallback.** I used 1963 and reported a three-year RMD tail; it is
  two. Caught only because Engine C put the jump in a different year.
- **RMD basis is the prior year-end balance**, not the grown one. Dividing the grown balance inflates
  every RMD by 4.5%, silently — nothing throws and the figures stay plausible.
- **Floor conversions and balances at zero.** An RMD can drive a balance negative and produce a
  negative conversion in the exhausted-balance region.

Every one surfaced from a cross-check, none from reading the code. That is the argument for checking
the implementation against §4 rather than the reverse.

**Standing harness traps (OPERATIONS §C):** engine P objects need `asOfYr` or every tax silently
NaNs · `applyLoadedData` takes a **wrapper** and mutates module globals without re-rendering, so park
off the target tab · `dobA`/`dobB` must be `"YYYY-MM-DD"` **strings** · seed `Math.random` **before**
importing the bundle · stub `globalThis.URL.createObjectURL`, not just `window` · anything added to
`shim.txt` must use the guarded `_g("name")` form · the run folder is **flat**, not the repo layout.

**Known warts, deliberately not fixed here:** `controls.sh` is pinned at v5.38 and cannot run against
the current pair · `t15` defaults to tag `v514` and dies if run bare · `census.cjs` double-reports
object-shorthand positions (over-reports, safe).

---

## 8. Out of scope — resist these

`div_y` / `capGain_y` (next release, and larger — `gainByYr` has zero hits in this block) · the §86
cliff at L8841–8844 (real, cheap, $0 on every household measured) · Engine B's omitted ½-benefits cap
· Engine C's HSA-inflated dividend base · spouse B's ungated SS at L8822 · Engine C itself, which is
the comparison reference and must not be edited.

The last four belong in one tidy-up scope, not four.

---

## 9. Definition of done

Suite green with counts parsed from output · parity 8/8 · five new assertions with negative controls
that fired · `smoke_built` 16/16 · four version sites · METHODOLOGY and CHANGELOG updated · knowledge
refresh with the manifest rolled, `.jsx` rotated (v5.41 current, v5.40 prior, **exactly two**), and
manifest rows added for the eight `qa/tools/*.mjs` files.

**If budget runs short, stop and hand off a clean partial state with what remains. Never a thin pass
presented as complete.**
