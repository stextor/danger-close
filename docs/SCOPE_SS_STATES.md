# SCOPE — the seven "half-rate" Social Security states follow their own law (D-19), and Utah's 2026 rate

**FULFILLED — shipped in v5.85.** L-1 to L-4 all as recommended (Steve, 2026-09-29). See §7. Retained as the record. Target **v5.85**, built from **v5.84** (source
`1d7208800a325e78220917d3f767b517`, built `index.html` `985b488bf4d622970ef52f055d90bbaa`, repo `2cfdc05`). **A modelling release:**
state tax moves for households in these seven states; METHODOLOGY changes.

---

## 1 · Premise — measured, and read from primary sources

**The model.** `stateTaxAnnual` (source L1326–1476) taxes `rate × (retirement base + work + ss × federally-taxable SS + gains)`
(L1473–1475). Seven states carry `ss: 0.5` — "half of taxable SS" — for **every household, whatever its income or age**: CO, CT,
MN, NM, RI, UT, VT (`MissingFeatures.md` D-19; Montana's 0.5 was found two years stale at v5.73).

**The law** (tax year 2026 where published; read 2026-09-29):

| State | Rule | Source |
|---|---|---|
| **CO** | **65+: ALL** federally taxable SS subtracted (TY2022+), no income limit. **55–64:** all if AGI ≤ $75,000 single / $95,000 joint (TY2025+), else a $20,000 cap. The SS subtraction **reduces** the pension subtraction (shared $24,000 / $20,000 cap). | CO DOR, *Income Tax Topics: Social Security, Pensions and Annuities*; 2025 Book 104; DR 0104AD |
| **CT** | **None** taxed if federal AGI **< $75,000** single/MFS, **< $100,000** joint/HoH/QW; at or above, at most **25 % of total benefits** taxed. A cliff. | CT DRS, *Tax Tips for Senior Citizens*; OLR 2024-R-0130, 2025-R-0152 |
| **MN** | Simplified subtraction of all SS in AGI if AGI ≤ **$110,780** joint / **$86,410** single/HoH (TY2026, indexed), reduced **10 % per $4,000** (or fraction) above. Alternative method: max $5,840 / $4,560, not indexed. | MN DOR, *Tax Year 2026 Inflation-Adjusted Amounts* (Minn. Stat. 290.0132 subd. 26) |
| **NM** | **None** taxed if AGI ≤ **$100,000** single / **$150,000** joint, HoH, surviving spouse / $75,000 MFS; a hard cliff. | NMSA 7-2-5.14 (Laws 2022 ch. 47 §7); NM TRD exemption page (May 2026) |
| **RI** | **None** taxed if the taxpayer has reached **full retirement age** (SSA) AND federal AGI **< $107,000** single/HoH/MFS, **< $133,750** joint (TY2025; indexed; TY2026 not yet published); a cliff. | R.I. Gen. Laws § 44-30-12; RI Division of Taxation ADV 2025-22 |
| **UT** | A nonrefundable credit = the income-tax rate × SS in AGI, **reduced by $0.025 per dollar** of modified AGI over **$54,000** single / **$90,000** joint, HoH / $45,000 MFS. | Utah Code § 59-10-1042 (version effective 1/1/2026) |
| **VT** | **None** taxed if AGI ≤ **$55,000** single / **$70,000** joint; the exempt share falls proportionally over the next **$10,000**. Not indexed. | VT Dept of Taxes, *Social Security Exemption*; 2025 Act 71 (32 V.S.A. § 5830e) |

**Also found — Utah's rate.** S.B. 60 (2026 General Session), signed 23 March 2026, cuts Utah's flat rate **4.50 % → 4.45 %**
retroactive to tax year 2026 (Utah House of Representatives session summary; the bill). The model has `rate: 0.045`. Utah's SS
credit is defined as the §59-10-104(2) rate, so it moves with it.

**Settled at scoping (Steve asked for the recommended handling of four open items):** NM — the 2026 bills to lift the cap (HB 92,
SB 156) show no enactment (HB 92's last action is a February committee hearing; TRD's page still states the cap in May 2026); the
"2036" in a fiscal note is HB 92's own proposed schedule, not current law. **The Secretary of State's chaptered-bill list renders by
script and could not be read** — the build re-checks it. UT — the phase-out is $0.025 per dollar (the statute; a "$1 per $4" in
secondary sources is wrong). RI — 2026 thresholds are unpublished; §6 L-3 decides. CO — the shared cap is modelled (§6 L-2).

**Measured** (session instrument; Engine B driven dollar-exact; the SS share of state tax only; the example and three fixture
households moved into each state). ⚠ Approximations: Engine B's `magi_y` stands in for AGI; RI's age test is applied to both
spouses together; CO's shared cap is ignored. Magnitudes, not pins:

| State | Lifetime Δ, model − statute (example / single / band / streams) | Direction |
|---|---|---|
| CO | +$20,028 / +$10,367 / +$3,936 / +$20,498 | model **pessimistic** — Colorado taxes none of it past 65 |
| CT | +$11,014 / +$4,851 / +$2,973 / +$11,053 | pessimistic |
| MN | +$295 / −$2,747 / +$2,594 / −$2,175 | both |
| NM | +$14,107 / −$1,649 / +$4,383 / +$15,930 | both (the cliff) |
| RI | −$2,027 / −$1,683 / +$3,300 / −$1,493 | both |
| UT | −$1,779 / −$6,283 / −$565 / −$3,467 | model **optimistic** |
| VT | **−$28,928** / −$15,551 / −$828 / **−$30,747** | model **optimistic** — the example sits above Vermont's $70K line, so Vermont taxes ALL of it |

A single factor cannot be right: the rules are income- and age-conditioned, and the error changes sign with the household.

## 2 · The change

- **A · A per-state Social Security rule** (L-1) replaces `ss: 0.5` for the seven states, evaluated each year from that year's
  AGI proxy, filing status and each spouse's age. Kinds needed: *exempt-by-age* (CO), *cliff* (NM, RI; CT's cliff with a 25 %-of-
  total cap above), *linear phase-out* (VT), *step phase-out* (MN), *credit with a per-dollar phase-out* (UT). The existing
  `exclTest` machinery (`bands`, `phaseout`, `taper`) covers some shapes; the scope does not pre-judge reuse vs a new field.
- **B · Utah's rate** 4.50 % → 4.45 % (L-4).
- **C · Disclosures:** each changed entry's `note`; METHODOLOGY's state-tax section; `MissingFeatures.md` D-19 → fixed.

## 3 · Site census (v5.84, AST) — to be completed at build

`STATE_RULES` entries L1133 (CO), L1149 (CT), L1185 (MN), L1228 (NM), L1260 (RI), L1265 (UT), L1266 (VT); `stateTaxAnnual` L1326–1476
(the `ssBase` line L1473); its three callers L4506, L4631, L5865 (Engines A, C, B) — each must pass what the rules need (AGI proxy,
filing status, ages; most already pass ages). **Owed at build:** which suites pin state tax for these seven states (`t35`, `t39`,
`t34`, `state_sets*`, `controls_state*` are candidates) — by `literal_census.cjs` and the run, never by grep.

## 4 · Tests (written and run FIRST, against v5.84, where they must fail)

A new suite, dollar-exact at `stateTaxAnnual`: for each state, hand-computed cases at the threshold −$1 / at / +$1 and inside
each phase-out (MN's steps, VT's proportion, UT's 2.5 ¢), the age conditions (CO 55/64/65, RI full retirement age per spouse),
CT's 25 % cap; each case's expected value typed from §1's sources, not read from the app. Extinction: no state keeps a scalar
`ss` other than 0 or 1 where its law is conditioned. The example household in VT and CO pinned end-to-end. Negative controls.

## 5 · Out of scope

D-18 (a general tax-year refresh of indexed state figures), D-20 (Montana's base), MN's alternative subtraction beyond the
simplified method if L-2 so decides, Railroad Retirement (the model has none), part-year residency.

## 6 · Open decisions for Steve

**L-1 · How the rule is represented.** (a) **A per-state SS rule with a small set of kinds** (§2 A), evaluated per year —
exact to each statute; (b) re-fit each state's scalar to a "typical" household — simpler, but §1 shows the error changes sign
with income, so any scalar is wrong for someone. **Recommend (a).**

**L-2 · How much of each state's detail.** (a) **Model** CO's shared pension cap (SS consumes it — the conservative direction),
RI's full-retirement-age test **per spouse** (as RI's pension rule already does), and MN's **simplified** method only, disclosing
that the alternative method (at most $5,840 of subtraction, relevant only above ≈ $150K joint) is omitted — omitting it is
conservative; (b) all of it, including MN's alternative method. **Recommend (a).**

**L-3 · Indexed thresholds (MN, RI).** (a) **Use the latest published figures** (MN 2026, RI 2025) as constants, disclosed, and
leave indexing to D-18 — RI's 2025 figure is slightly low for 2026, so a few households near the line are taxed that RI would
not tax: the conservative direction; (b) index them now. **Recommend (a).**

**L-4 · Utah's 2026 rate cut (S.B. 60).** (a) **Include it** — it sits in the same table row, makes an existing output more
correct, and Utah's SS credit is defined by that rate; (b) leave it for a separate release. **Recommend (a).**

## 7 · Build record — 2026-09-29

**Decisions (Steve), all as recommended:** L-1 (a) a per-state `ssRule` · L-2 (a) CO's shared cap, RI's age test per spouse, MN's
simplified method only · L-3 (a) latest published thresholds, fixed · L-4 (a) Utah 4.45 %.

**Built as scoped.** `stateTaxAnnual` evaluates each state's rule per year and per spouse from its own AGI measure; no caller changed
(all three already passed ages and gross benefits). Kinds: `age` (CO), `cliff` (CT, NM, RI), `step` (MN), `linear` (VT), `credit` (UT).

**`t50` first** (32 statute-typed cases): failed 29 on v5.84, 32/0 on v5.85. **Found by the suites and fixed before shipping — each
a flaw in my code:** (1) CT's 25 %-of-total cap summed spouse A's gross only on a single return — a widowed survivor's benefit in
B's slot would have gone untaxed (t50 CT-4); (2) the count-only path (callers without ages) subtracted nothing for CO — the 65+
count now stands in for age, and CO's cap reduces the household exclusion; (3) CT's cap with gross unknown computed $0 — now not
applied (conservative); (4) I first carried CO's shared cap in `ssOffset`, which v5.56 DECIDED is Maryland's and Maine's
mechanism — CO has its own `ssSharesCap` (t10's decision checks caught it).

**13 existing pins moved, each verified against the statute, and version-gated** (v5.84 and earlier keep theirs): t10 — CO both-65+
$1,848 → $2,508 and one-65+ $2,904 → $3,564 (t10's "single" case is a joint return with one spouse 65+); seven RI cases (the other
half of the benefit, now taxed or exempt by the cliff and the age test); NM $1,127 → $882; the seven-states structural check
replaced. t35 — CT B-7 $2,550 → $3,300 (gross unknown, no cap); section E needs a household that owes CT tax (the example household
now correctly owes $0). Both legs green.

**The Field Manual said twice that Colorado's shared cap is not modelled** — false from v5.85; corrected in-app. Negative controls
`controls_v585_ss_states.py` 9/9. **Colorado's lifetime tax rises** on the example household ($50,558 → $60,200): SS subtraction now
consumes the pension cap, as the statute says — the old model's own note said it overstated the exclusion. §1's measurement covered
the SS share only, which is why its Colorado direction differs. **Also recorded, not changed:** Engine A's state call passes
`single: !!P.single`, not a widow-aware status (pre-existing).

**Workspace drift, handled per the project rule:** after an environment outage this turn, the workspace copy of this file carried a
§7 I had not written (accurate in substance, but unreviewed). It was quarantined, the file reverted to the repo's copy, and this
record re-applied deliberately. No other file differed from the last verified backup.

