# SCOPE — v6.07 · D-33: a Roth conversion, a QCD and an RMD never take non-qualified annuity money

**FULFILLED — shipped as v6.07 (2026-10-12).** Repo-only. §7 is the build record. D-33 closes; D-34 opens.

*(Superseded status line, retained:)* **READY — 2026-10-12.** All four decisions taken (§5) — Steve took every recommendation. Repo-only. A MODELLING release: figures move, METHODOLOGY changes.
Steve, 2026-10-12: *"let's do D-33"* — D-33 alone, E-29 kept for separate builds.

## 0 · Premise (verified against v6.06, not assumed)

Freshness (OPERATIONS §A): repo `9edbffd` = `origin/main` (the v6.06 commits and the chmod fix), fresh clone; source
`a5ac49a570a2e776a26ad64536420566` = repo = CHANGELOG newest; built `fa02504f34989cb2054de3f5d9e9138f` = live Pages (both re-hashed 2026-10-12).

### 0.1 · The law (primary sources, read 2026-10-12)

- **Conversion.** 26 U.S.C. §408A(c)(5)(A): no rollover contribution may be made to a Roth IRA unless it is a *qualified rollover contribution*;
  §408A(e)(1) admits one only from another Roth IRA, from an *eligible retirement plan*, or from a 529 plan; §408A(d)(3)(B) takes "eligible
  retirement plan" from §402(c)(8)(B), which lists an IRA (§408(a)), an individual retirement annuity (§408(b)), a qualified trust, a §403(a)
  annuity plan, a governmental §457(b) plan and a §403(b) annuity contract. **A commercial (non-qualified, §72) annuity is none of them, so it
  cannot be converted.**
- **QCD.** §408(d)(8)(B): a qualified charitable distribution is "any distribution from an individual retirement plan (other than a plan
  described in subsection (k) or (p))". A non-qualified annuity cannot make one.
- **RMD.** A non-qualified annuity has none — the model has excluded it from the RMD *base* since v5.26 (METHODOLOGY, Other accounts).

### 0.2 · What the model does (parser census and measurement, v6.06)

The Other-accounts type `annuity` rides inside each person's Traditional pool as a **share** (`retireStartBalances` → `annShareA/B` =
(tradInit − rmdInit) / tradInit). Parser census (`qa/tools/census.cjs`, v6.06): `annShareA` 9 source sites, `_annShA` 7, `_annShareA` 11,
`annSh` 5 — every one inside `attributeRetIncome`, `retireStartBalances`, Engine A (`runRothStrategies`), Engine C (`computeIrmaaPlan`),
Engine B (`computeTaxPlan`) or the Roth tab's RMD cards.

| Site | What it does with annuity money (v6.06) |
|---|---|
| Engine A — conversion headroom `headA/headB` | `tradA − rmdA`: **the annuity is convertible** |
| Engine A — balance update | `tradA − rmdA − convA`; the share stays constant, so **every RMD and conversion drains annuity dollars pro rata** |
| Engine C — `qcd_y`, `conv_y` caps | `tradBal` / `tradBal − max(rmd, qcd)`: **annuity is QCD-able and convertible** |
| Engine C — balance update | pooled outflow; constant share — **the same pro-rata drain** |
| Engine B — `qcd_y`, `conv_y` caps and balance update | as Engine C |
| `attributeRetIncome` | "a conversion … leaves the whole leg: annuity by annShare" — **the state calculator is told part of every conversion is annuity** |
| Roth tab ladder — `_capA/_capB` | `grownA − rmdA`: **convertible** |
| Roth tab ladder — its own RMD `rmdA_y/rmdB_y` | the **whole** balance — annuity counted in the RMD (open since v5.44; METHODOLOGY "Annuity money is still inside this tab's RMD basis") |
| Roth tab RMD cards — with-conversion | `balance × (1 − static share)`: the share no longer describes a balance the conversions have drained |
| Engine D (`computeWithdrawalPlan`) | **not affected**: annuity money sits in the Priority-1 sleeve's ordinary sub-pool (`taxOrd`); the conversion is `min(rothAmount, tradNotional_boy − rmd_y)`, bucket money only |

**Probe** (session-only; the example household with its positions removed and a $300,000 annuity for B, so B's Traditional pool is 96 % annuity):
v6.06 converts **$280,000** in Engines B and C over the ladder and **$452,949** in Engine A's *current* strategy — money that in law cannot be converted.

## 1 · The change (prototype built and measured, §6)

Annuity dollars are **carried, not assumed**: each engine keeps its `annShare` interface but re-takes the share every year from the dollars that
are actually left. Concretely:

1. **Caps.** A conversion and a QCD are capped at the **non-annuity** balance — exactly the RMD base each engine already computes
   (`tradA × (1 − share)`). Engine A's per-person headroom becomes `tradA × (1 − _annShA) − rmdA`.
2. **Debits.** The RMD, any QCD above it and the conversion leave non-annuity dollars only; in Engines B and C they are split between the two
   legs by each leg's non-annuity balance after its RMD. The **spending draw keeps v6.06's pooled split** and takes annuity money at the year's
   share (§5 DD-2) — which is what `attributeRetIncome` already reports for a draw.
3. **The share** is re-taken at year end on what is left (the dollar-invariant rescale the death merge has used since v5.26). A share of 0
   stays 0.
4. **Attribution.** `attributeRetIncome` gives a conversion **no** annuity money; Engine B's state call splits the conversion between persons by
   the same non-annuity fraction its debit uses.
5. **Roth tab.** The ladder carries each spouse's annuity dollars (`annBalA/B`, growth only); its conversion cap and its own RMD use the balance
   less them; the with-conversion RMD card reads them off the rows. The no-conversion card keeps its static share (no outflow before RMD age,
   so the static share is exact there).

**Zero-annuity invariance (measured, §6):** for a household with no annuity every changed expression reduces operand-for-operand to v6.06's —
Engines A, B and C were run on seven state/QCD combinations of two annuity-free households and their full row output is **bit-identical** to v6.06.

## 2 · Site census (parser, at the build; recorded in §7)

Re-run `census.cjs` for `annShareA/B`, `_annShA/B`, `_annShareA/B`, `annSh`, `annBalA/B`, `_rmdBaseA/B`, `_fracQA`, `_outQ` on the staged
source and record the counts. Expected new sites: Engine A (headroom, update), Engine C (two caps, debit), Engine B (two caps, hoisted fraction,
attribution, debit), `attributeRetIncome` (one), the ladder (seed, RMD, cap, update, rows, `annAt`, card). Engine D: **zero** edits.

## 3 · Tests (new suite `t70_annuity_conversion.mjs`, both legs; existing pins re-pinned with reasons)

- **A · hand cases (dollar-exact, independently computed in the suite):** a two-person household with a known annuity; the per-year RMD and
  conversion of Engines B and C recomputed by a separate re-implementation of the debit for the first RMD years; Engine A's headroom.
- **B · extinction invariants:** (B-1) an all-annuity Traditional pool converts **$0** and makes **$0** of QCD in Engines A, B and C and in the
  ladder; (B-2) no year's conversion exceeds the non-annuity balance after the RMD; (B-3) `attributeRetIncome` gives a conversion $0 of annuity
  for any share; (B-4) with no draws, annuity dollars grow at exactly the growth rate (visible through the RMD base).
- **C · differential v6.06 → v6.07:** annuity-free households bit-identical in Engines A, B and C (the negative control); the example
  household moves in the direction §6 records.
- **D · structure (AST):** the four caps read the non-annuity balance; `attributeRetIncome` passes 0 as the conversion's annuity share.
- **Controls** `qa/tools/controls_v607_annuity_conv.py`: each fix reverted on its own must turn the suite red.
- **Existing pins that move (prototype run, §6):** t1 S-2 and S-8 (structural text of the ladder RMD and card); t23 B-1; t24 B[$50K]; t25 §B,
  C-1, E-3, E-4; t26 C-1, E-6, E-7, E-10; the parity check `rothOther`. Each is re-gated per leg with the new figure and the reason, never
  loosened.

## 4 · Out of scope, and stop conditions

Out of scope (recorded, not changed): **Engine D** (not affected); its conversion cap subtracting the sleeve's Traditional RMD from bucket money,
and Other-account Traditional IRAs never being convertible there — both pre-existing and not D-33; a **QCD from employer-plan money** (only an IRA
can make one; the cap still admits employer dollars — the attribution already sends a QCD to IRA dollars first, P2-4); the **after-tax basis** of
an annuity (still all ordinary income, disclosed); the **draw order**; **Engine A not draining the spending draw** (v5.84 — so its annuity share
moves with RMDs and conversions only); the employer share (unchanged: RMDs and conversions stay pro rata across IRA and employer dollars).

Stop conditions: any annuity-free household not bit-identical to v6.06 in A, B or C; any engine converting money from an all-annuity pool; a
moved figure in the Withdrawal tab or the Monte Carlo (Engine D and the MC must not move).

## 5 · Decisions for Steve — **taken 2026-10-12: DD-1 (a), DD-2 (a), DD-3 (a), DD-4 (a)**

- **DD-1 · How to fix it.** (a) **Carry the annuity dollars** — conversions, QCDs and RMDs never touch them (a QCD is IRA-only in law,
  §0.1, so it is the same defect class: two expressions); the share is re-taken each year *(recommended; prototyped)*. (b) Cap the conversion
  only and keep the constant share — smaller, but RMDs and conversions would go on draining annuity dollars pro rata, the same error by another
  door, and QCDs would still be taken from annuity money.
- **DD-2 · The spending draw.** (a) **Keep it pro rata** at the year's annuity share — v6.06's behaviour and what the state attribution already
  says *(recommended)*. (b) Spend annuity money first or last — a new draw-order assumption, outside D-33.
- **DD-3 · The Roth tab ladder's own RMD** (open since v5.44: it counts annuity money). (a) **Fix it in v6.07** — with the annuity dollars
  carried it is the same line *(recommended)*. (b) Leave it and keep the METHODOLOGY note.
- **DD-4 · Field Manual.** (a) **Add one sentence** saying conversions, QCDs and RMDs never take Annuity money from v6.07 *(recommended)*.
  (b) METHODOLOGY and CHANGELOG only.

## 6 · Measurement (prototype, session-only; staged source `300657b5…`, every recommended option; the shipped source adds only the DD-4 Field Manual sentence)

All figures are lifetime totals from the engines, $70,000/yr conversions where a conversion applies, 2 % yield, the base scenario.

**Annuity-free households — no change.** The example household with its annuity row removed, and with it re-typed Taxable, each in its own
state, PA, MD, IL and CA, with and without a $10,000 QCD (14 runs): Engines A, B and C **bit-identical** to v6.06, every row.

**The example household** ($7,000 of annuity, spouse B, 3.2 % of B's pool). Engine D and the Monte Carlo: not touched. Engine B lifetime RMD
$573,803 → $569,505 (−$4,298), total tax $215,911 → $215,219 (−$692); conversions unchanged. Engine C: RMD as Engine B; IRMAA unchanged ($0).
Engine A strategies move by up to ~$10,400 of conversions (fill22 $1,638,898 → $1,629,051) and ~$1,900 of tax. Roth tab with-conversion
RMD cards: A $44,991 → $44,842 (A holds no annuity, but B's smaller convertible balance shifts more of each year's conversion to A); B $3,178 →
$2,962; "Combined RMDs reduced by" rises $365.

**A larger annuity** (the example with B's annuity at $150,000, 41 % of B's pool): Engine B lifetime RMD $652,084 → $566,789 (−$85,295), total
tax $234,846 → $222,431 (−$12,415), conversions unchanged (the $70,000 still fits the non-annuity balance). Engine A fill22 converts $214,318
less. **This is the related defect the census found:** with a constant share, every RMD took annuity money with it pro rata, so v6.06
understated what the annuity was worth and overstated every later RMD.

**The probe** (96 % annuity): Engines B and C convert $280,000 → $88,717; Engine A's *current* strategy $452,949 → $104,067; Engine B total
tax $64,301 → $33,496.

**Direction — not one-way, and mostly favourable.** Removing impossible conversions lowers lifetime tax and lowers the strategy comparison's estate figure (money
that could not reach a Roth no longer does); removing the RMD drain lowers RMDs and tax. The plan looks **better** on the tax figures for
annuity households — because v6.06 was forcing annuity money out through RMDs the law does not require — and **worse** on the Roth/estate
figures where conversions were large.

**Prototype suite run (both legs, run folder tagged v606 so only behaviour differs):** **30 checks fail in 11 suites, every one expected** —
the example household's $7,000 annuity, or text this release rewrites: t1 S-2, S-8 (the ladder RMD and card expressions); t23 B-1; t24
B[$50K] (its statute model counts annuity in the RMD); t25 §B ×6, C-1, E-3, E-4 (Engine C's dollar pins, 2039–2043); t26 C-1, E-6, E-7, E-10
(E-10's negative control — "A unmoved" — no longer holds: see the cards above; the control becomes an annuity-free household); t40 A3, A5 ×2,
B3, E1, E2, E4; t42 D-3; t56 F-2 (PA: the pension owner moves state tax by $2 × 10⁻¹³ in 2042 — floating-point order in the new per-leg split;
the check compares exact JSON and becomes a to-the-cent comparison on v6.07 legs); t57 A5 (a conversion now carries $0 of annuity — inverted as
the extinction pin); parity `rothOther`; tooling `domdiff` TAXES and IRMAA (the pair now moves by design, as at v5.43 and v5.47). t45, t47,
t48: green. Each is re-gated per leg with the new figure and its reason, never loosened.

## 7 · Build record (v6.07, 2026-10-12)

- **Source** `ee557028aba1dfb1acb5bb647f6c5630` (24 anchored edits, each counted once on v6.06: `attributeRetIncome` (comment and the conversion's share), Engine A (headroom,
  the debit with the share re-taken), Engine C (the QCD and conversion caps, the debit), Engine B (the QCD cap, the conversion cap, the hoisted
  fraction, the attribution, the debit), the ladder (seed, RMD, cap, update, rows, `_annOf`, `annAt`, the card), the Field Manual, four version sites).
  **Built** `5b444023ed72ebca40c9d0443b2ddf05` (`smoke_built` 22 passed, 0 failed).
- **Census (parser, `census.cjs`, on the shipped source):** `annShareA` 10 source sites (9 at v6.06 — the ladder's seed); `_annShA` 10; `_annShareA` 17;
  `annSh` 4; `annBalA` / `annBalB` 7 sites each; `_rmdBaseA` 15; `_fracQA` 11; `_outQ` 8; `_attrQA` 3; `_annOf` 3; `annAt` 2. **Engine D:** zero
  edits — `computeWithdrawalPlan`, `withdrawalPlanSeries`, `retireStartBalances`, `stateTaxAnnual` and `runMonteCarlo` byte-identical to v6.06 by AST.
- **No stop condition fired:** the annuity-free households bit-identical in A, B and C; no engine converts from an all-annuity pool; Engine D and the
  MC unmoved (MC parity 10/10).
- **Found by the controls, fixed before the final run:** K11 (the ladder's own RMD on A's annuity) first MISSED — it moves no card, since A's window has
  closed by A's first RMD year. `t70` E-5 reads the ladder table's MAGI; K11 fires on it. The ladder's B line is not controlled separately (B's first
  RMD year falls after the ladder ends on every fixture; it is the A line's twin).
- **Controls' own restore check:** the first full controls run fired 15 of 15 but reported `restored: NO` — its folder linked `node_modules` to another
  run folder, so esbuild wrote different module-path comments into the rebuilt DOM bundle. Re-run in a folder with its own `node_modules`: 15 of 15,
  restored byte-identically.
- **`t70`** 36 (v6.07) / 33 (v6.06). **Controls 15 of 15.**
- **Suite:** 6,431 app checks, 69 suites, 0 failed, 0 DIED; GRAND 6,566. Every current-leg count equals v6.06's but `t1` (181: S-8's v6.07 branch pins the carried annuity in two checks where v6.06's pinned the static share in one), `t69` (15 on both legs: its group B, the v6.05 → v6.06 differential, runs only in a folder holding the v6.05 module — by design, and it prints so) and the new `t70`; the v6.06 leg equals v6.06's own counts, `t69` and `t70` aside (33, pinning the defect). Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v606 v607 from the build workspace — a full clone of 9edbffd carrying exactly the packaged changes, each changed file's run-folder copy hash-checked against it (v6.06 resolved from history, commit 9232406) — each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 6344, half B GRAND 222; none DIED.
