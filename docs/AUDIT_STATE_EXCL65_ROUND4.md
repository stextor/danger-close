# AUDIT — New Mexico, Rhode Island and Wisconsin against statute (ROUND 4)

| Field | Value |
|---|---|
| Build audited | **v5.58** · source `6690b2c78953a7a4a1cee413d3523b59` · built `index.html` `ae9ac897595bba39785f8a6e04bd9e1a` · tree `3d7c205` |
| Baseline at audit | **2,864 app checks, 0 failing** · per-leg 1,092 × 2 · run-once 670 · parity 10/10 · tooling 82 · GRAND 2,946 — recomputed from suite output this session, batched per `TESTING.md` |
| Date | 2026-09-01 |
| Shape | **FINDINGS ONLY. Nothing fixed, no source change, no figure moves, no scope proposed.** |
| Predecessors | `AUDIT_STATE_EXCL65_NOTES.md` (MD/ME/CO), `AUDIT_STATE_EXCL65_ROUND2.md` (KY/DE), `AUDIT_STATE_EXCL65_ROUND3.md` (VA/WI/NJ/ME) |
| Closes | **D-A** in ROUND3 §6 · refines **D-B** |

---

## 0. Why this exists, and the headline

ROUND3 §3 recorded New Mexico and Rhode Island as **unread**: both sit in the F-6 guarded set,
both carry `ss: 0.5` as well as an `excl65`, and every statement ROUND3 made about them was
labelled a structural inference from `STATE_RULES` rather than a fact. This round reads both
statutes and closes that gap.

**The headline is not the one the brief anticipated.** New Mexico and Rhode Island are not a second
optimistic-direction group, and they are not a mirror of Virginia. Both are **direction-mixed**:
the model over-taxes some households and under-taxes others, with the sign flipping at a hard
statutory cliff. Re-checking Wisconsin's age arithmetic against the model's own floor shows it
flips too, in a window ROUND3 did not consider.

**All three flip for the same structural reason**, and it is the reason ROUND3 §4 already named:
`excl65 × persons65` cannot express a gate. Where the statute gates on income, the model applies
the exclusion above the gate. Where it gates on an age other than 65, the model applies it at 65.
Every flip in this document is a gate the data model has no way to represent.

This document does not propose a scope. §6 states firm recommendations; building waits on the
maintainer, per the project's own rule.

## 1. Method

**Statute first, then the department, and the model's own notes never.** Every dollar figure below
comes from the enacting code section or the session law. Departmental publications are cited only
where they resolve a genuine ambiguity in the statutory text, and where that happens it is said so
explicitly rather than blended into the statutory claim — the one instance is flagged in §2b.

**Amendment history recorded, per ROUND3 §3's method note.** Saying which amendments did *not*
touch a subdivision is what lets the next reader trust a figure without re-reading it.

**Code facts printed, not recalled.** `STATE_RULES` was read by AST from the shipped v5.58 source;
`stateTaxAnnual` was read at L1114–1160; the F-6 matcher was **executed** by `qa/tools/f6_probe.cjs`
rather than grepped, per `OPERATIONS.md` §B1a.

⚠ **The direction figures in §2 and §4 are BASE-ERROR isolations, not tax estimates.** They apply
the model's own flat rate to the difference between the model's taxable base and the statutory base,
holding the household constant. New Mexico's real schedule is graduated 1.5–5.9% and was
restructured for TY2025; Rhode Island's is three-bracket. **No figure below is a claim about a real
state tax bill.** It is a claim about how far the model's base is from the statute's, and in which
direction.

## 2. Per-state findings

### 2a · New Mexico — the exclusion is dead above $51,000, and has been since 1987

Modelled: `excl65: 8000`, `ss: 0.5`, `rate: 0.049`, no `exclAge` (so the model's floor is 65).
Note: *"SS exempt under $100K single/$150K MFJ; $8K 65+ exemption income-limited"*.

**Statute — N.M. Stat. § 7-2-5.2.** The $8,000 exemption for individuals 65 or older is delivered
by a **nine-band stepped table**, not a taper and not a single cliff:

| MFJ / head of household / surviving spouse — AGI | exemption, each |
|---|---|
| not over $30,000 | $8,000 |
| then down $1,000 per additional $3,000 of AGI | $7,000 … $1,000 |
| **over $51,000** | **$0** |

Single filers: full $8,000 to $18,000 of AGI, stepping down per $1,500, **zero above $28,500**.
Married filing separately: **zero above $25,500**.

**These thresholds have never been indexed.** The section's history is *Laws 1985, ch. 114, § 1;
1987, ch. 264, § 6* — and nothing after. The bands are 1987 dollars, thirty-nine years stale by
construction rather than by legislative neglect of a particular figure.

**The consequence for this app is categorical.** A mainstream retired couple within sight of
retirement is above $51,000 of AGI essentially always. **For that couple the statutory New Mexico
65+ exemption is exactly zero**, and the model grants $8,000 per person unconditionally. This is
not "income-limited and approximated as unconditional" in the Virginia sense, where a real
deduction tapers away over a range the model ignores. In New Mexico the model is applying a
provision that, for its own target household, does not exist.

**Statute — N.M. Stat. § 7-2-5.14** (SS). The exemption equals the §86-includible Social Security
amount, **provided** AGI does not exceed **$150,000** MFJ / head of household / surviving spouse,
**$100,000** single, **$75,000** MFS. History: *Laws 2022, ch. 47, § 7*, applicable to taxable years
beginning on or after 1 January 2022 — **with no subsequent amendment in the codified text.**

**It is a hard cliff, and the model's `ss: 0.5` is a blend across it.** Below the threshold the
statute taxes **0%** of federally-taxable Social Security; at or above it, **100%**. There is no
50% state anywhere in the provision. The model taxes half either way.

**So the note is true but radically incomplete on the exclusion half, and structurally wrong on the
SS half** — it describes the SS thresholds correctly and then models something the statute does not
contain.

*(2024 HB 249 would have indexed the SS thresholds; 2026 HB 92 and SB 156 would have removed the cap
entirely. None appears in the codified amendment history, and none is listed in the Taxation and
Revenue Department's Legislative Summary: 2026. See §3 for what that does and does not establish.)*

### 2b · Rhode Island — the modelled figure is a full legislative cycle stale, and one qualifying condition is invisible to the model

Modelled: `excl65: 20000`, `ss: 0.5`, `rate: 0.05`, no `exclAge` (floor 65).
Note: *"SS + $20K pension/401k exclusions income-limited"*.

**Statute — R.I. Gen. Laws § 44-30-12(c)(9)**, as amended by **P.L. 2024, ch. 117, art. 6, § 21,
effective 1 January 2025.** The pension and annuity modification steps: **$15,000** for TY2017–2022,
**$20,000** for TY2023–2024, and **$50,000 for tax years beginning on or after 1 January 2025.**

**The model carries $20,000 — the TY2023/TY2024 figure.** This is the Wisconsin defect shape
exactly: a real provision at a superseded amount.

Four conditions the statute attaches, of which the model expresses none:

1. **Age is full retirement age, not 65.** The statute says *"the age used for calculating full or
   unreduced Social Security retirement benefits"* — **67 for anyone born 1960 or later**. The
   model's floor for RI is 65 (no `exclAge`; only DE at 60 and KY at 0 carry one). A 65- or
   66-year-old Rhode Island retiree qualifies for nothing and the model grants them the full amount.
2. **The AGI test is a hard cliff**, at the (c)(8) thresholds, which (c)(9)(vi) ties (c)(9) to.
   For **TY2025** those are **$133,500 MFJ / $107,000 single and MFS**. Under = full modification;
   at or over = none.
3. **IRA distributions do not qualify at all.** Only income properly on federal Form 1040 **line 5b**
   — pensions, 401(k), 403(b), governmental 457(b), TSP, annuities. Traditional, Roth, SEP and
   SIMPLE IRA distributions (line 4a/4b) are excluded, as are completed rollovers into an IRA.
4. **The SS modification (c)(8) carries the same two gates** — full retirement age, and the same
   inflation-adjusted AGI cliff — and where it applies it removes **all** federally-taxable Social
   Security, not half.

⚠ **One figure here is department-load-bearing and is flagged rather than blended.** The statutory
text at (c)(9)(i)(B) reads *"For a married individual filing jointly … an amount not to exceed fifty
thousand dollars"*, which does not unambiguously settle whether the cap is per return or per person.
**The Division of Taxation resolves it as per person** — *"an individual modification, so a joint
filing return may report up to a $100,000 modification, if both individuals qualify"* — and works
the case through a two-spouse example. The per-person reading is almost certainly right and the
singular *"a married individual"* supports it, but **the $100,000 couple figure rests on the
Division's guide, not on the statute alone.** ROUND2 found that source class unreliable for Kentucky
and Delaware. Treat accordingly.

⚠ **Change enacted in the 2026 session, effective TY2027.** House Bill 7127 Substitute A (FY2027
budget), Article 6 § 5, **removes the age threshold from the Social Security modification** for tax
years beginning on or after 1 January 2027, retaining the income threshold. The pension and annuity
modification's full-retirement-age condition is not described as changed. **This matters for an app
that projects decades forward**: from TY2027 the SS gate is income-only. Sourced to the Division's
*Summary of Legislative Changes*, 22 July 2026 — see §3.

### 2c · Wisconsin — ROUND3's direction finding is right for 67+ and incomplete below it

ROUND3 §2b established the statute and is not disturbed here: Wis. Stat. § 71.05(6)(b)54m., created
by 2025 Wis. Act 15, gives **$24,000 at 67+, $48,000 for joint filers where both are 67+, with no
income limit**; the model's **$5,000** is the older provision, which requires 65+ **and** federal AGI
under $15,000 single / $30,000 married. **Wisconsin's statute was not re-read this session** — it is
carried forward as an established premise.

What is added here is arithmetic against the model's own floor, which no previous round did.

**The model has no `exclAge` for Wisconsin, so it grants $5,000 from age 65.** A 65- or 66-year-old
Wisconsin couple with meaningful income qualifies for **neither** provision — too young for the
$24,000, too well-off for the $5,000. The statute gives them zero and the model gives them $10,000.

**So Wisconsin flips as well**, optimistic for the two years before 67 and conservative thereafter:

| both spouses | model base tax | statutory base tax | model − statute | direction |
|---|---|---|---|---|
| age 65–66, AGI $80,000 | $2,650 | $3,180 | **−$530** | optimistic |
| age 67+, same household | $2,650 | $636 | **+$2,014** | conservative |

*(Withdrawals $60,000, `rate` 0.053, `ss` 0 — base-error isolation per §1.)*

**ROUND3's headline survives**: over a full plan the conservative years dominate heavily, and
Wisconsin is not a D-3c member. But *"the error runs CONSERVATIVE"* is true of the 67+ case and
silent on the window below it, and the model's 65 floor is what creates that window. This is
recorded in §5 as a refinement owed, not a contradiction.

## 3. What was NOT established — stated plainly

- **Neither state's 2026 session laws were read directly.** For New Mexico the conclusion that the
  SS caps survived rests on the codified amendment history ending at Laws 2022, ch. 47, § 7 plus
  the absence of any such item in TRD's Legislative Summary: 2026. For Rhode Island the TY2027 age
  change rests on the Division's July 2026 summary citing HB 7127 Sub A Art. 6 § 5 — **the enrolled
  bill text was not read**, and the Division's own citation in that summary points at
  § 44-30-2.6(c) where § 44-30-12(c) is meant, which the document itself warns may happen.
- **Rhode Island's TY2026 inflation-adjusted thresholds.** Published in ADV 2025-22 (November 2025),
  located but not read. **TY2025 — $107,000 / $133,500 — is the only verified pair.**
- **Whether the $100,000 Rhode Island couple cap survives on the statute alone** (§2b).
- **Wisconsin's statute**, carried from ROUND3 rather than re-read (§2c).
- **Whether New Mexico's stepped table interacts with its graduated rate schedule** in any way a
  flat-rate model would need to reflect.
- The **11 states** ROUND2 lists as unchecked remain unchecked. This round added NM and RI to the
  verified set. **The verified set is now MD, ME, CO, KY, DE, NJ, VA, WI, NM, RI — ten of nineteen.**

## 4. The finding — the class is defined by a gate the data model cannot hold

ROUND3 §4 established that `excl65` (a scalar) and `persons65` (a count) cannot express a taper,
bands, a cliff, a household cap, a non-65 age, or an income measure excluding Social Security. This
round supplies the consequence: **wherever the statute puts a gate the model cannot hold, the model
does not merely lose precision — it changes sign across the gate.**

**New Mexico**, MFJ, both 68, SS $48,000 gross / $40,800 federally taxable, `rate` 0.049:

| withdrawals | federal AGI | model | statute | model − statute | direction |
|---|---|---|---|---|---|
| $60,000 | $100,800 | $3,156 | $2,940 | **+$216** | conservative |
| $109,200 | $150,000 | $5,566 | $5,351 | **+$216** | conservative |
| $120,000 | $160,800 | $6,096 | $7,879 | **−$1,784** | optimistic |
| $180,000 | $220,800 | $9,036 | $10,819 | **−$1,784** | optimistic |

Below the SS cliff the two halves nearly cancel — the exclusion half is optimistic by $784, the SS
half conservative by $1,000, net **+$216**. Above it both halves turn optimistic together. **The two
errors that have been masking each other stop masking each other at exactly $150,000 of AGI.**

**Rhode Island**, same household, `rate` 0.05, both past FRA:

| withdrawals | federal AGI | model | statute (all 401k) | statute (all IRA) |
|---|---|---|---|---|
| $40,000 | $80,800 | $1,020 | $0 → **+$1,020** conservative | $2,000 → **−$980** optimistic |
| $80,000 | $120,800 | $3,020 | $0 → **+$3,020** conservative | $4,000 → **−$980** optimistic |
| $100,000 | $140,800 | $4,020 | $7,040 → **−$3,020** optimistic | $7,040 → **−$3,020** optimistic |

And the same couple at 65 rather than 68, under the cliff: model $2,020, statute $5,040 —
**−$3,020, optimistic**, because neither spouse has reached full retirement age.

**Rhode Island's sign therefore depends on three things at once**: which side of the AGI cliff the
household is on, whether both spouses have reached FRA, and **whether the traditional balance is an
employer plan or an IRA.** The last of those is not a modelling approximation the app has chosen —
it is a distinction `STATE_RULES` has no field for and the engines never carry.

**What this means for the grouping decision.** The optimistic-direction income-limited class that
D-3c describes has exactly two verified members, New Jersey and Virginia, and they do share the
property that defines it: applying the exclusion unconditionally makes the plan look better than the
statute allows, at every income the app models. New Mexico, Rhode Island and Wisconsin do not have
that property. They have a **different** one — a modelled figure that is right on one side of a gate
and wrong on the other — and it is not served by the same fix, the same disclosure, or the same
release.

## 5. Corrections owed to existing documents

Recorded rather than made; this document changes nothing.

| Where | What is wrong | Direction |
|---|---|---|
| `STATE_RULES.RI` | `excl65: 20000` is the TY2023–24 figure; TY2025+ is $50,000 per qualifying person. Also: floor is FRA not 65, the AGI test is a cliff, and IRA income does not qualify | user-facing, **mixed** — conservative above FRA and under the cliff, optimistic otherwise |
| `STATE_RULES.RI.note` | *"SS + $20K pension/401k exclusions income-limited"* — stale figure; and "income-limited" understates a hard cliff | user-facing |
| `STATE_RULES.NM.note` | *"$8K 65+ exemption income-limited"* is true but reads as a partial reduction; the exemption is **zero above $51,000 MFJ / $28,500 single** and unindexed since 1987 | user-facing, optimistic |
| `STATE_RULES.NM` | `ss: 0.5` blends across a hard 0%/100% cliff at $150,000 MFJ; the note states the thresholds correctly and the model then ignores them | user-facing, mixed |
| `AUDIT_STATE_EXCL65_ROUND3.md` §2b | *"the error runs CONSERVATIVE"* holds for 67+; the model's 65 floor creates a 65–66 window where it runs optimistic (§2c) | internal, refines a direction claim |
| `AUDIT_STATE_EXCL65_ROUND3.md` §6 D-A | recommends verifying NM and RI *"since both carry `ss: 0.5` and may form a second group"* — they do form a second group, but not the one implied: it is defined by the gate, not by the SS factor, and Wisconsin belongs to it | internal, mis-scopes |
| `TESTING.md` L5 | *"`t10` 213 current leg, 209 frozen"* — measured **213 on both legs** this session; the parenthetical was true of the v5.56→v5.57 pair and went stale when the roles rolled forward | internal, harmless |

## 6. Decisions, with recommendations

**D-A · Class membership — this closes it.**
On verified statute the optimistic-direction income-limited class is **New Jersey and Virginia**,
and nothing else. Maine is out (ROUND3 §2d), Wisconsin is out (§2c), and **New Mexico and Rhode
Island are out** — not because they lack an income limit, but because their error changes sign
across it.
*Recommendation: close D-A as **NJ + VA**, and open a new numbered finding in `MissingFeatures.md`
for the group this round actually found — states whose modelled figure is correct on one side of a
statutory gate and wrong on the other, currently **NM, RI, WI**. That finding, not D-3c, is where
the RI and WI corrections belong.*

**D-B · Wisconsin — does it get its own fix, and when?**
*Recommendation: **do not give it its own release. Ship it with Rhode Island.*** ROUND3 recommended
handling WI separately, on the reasoning that its direction is opposite to D-3c's. That reasoning is
sound and this recommendation does not contradict it — RI is not a D-3c state either. WI and RI are
the **same defect**: a real provision carried at a superseded amount, with an age floor the model
puts at 65 and the statute puts at 67. One release, one defect class, one direction story that can
be told honestly in a single CHANGELOG entry. Bundling WI with an *optimistic* correction is what
D-3 forbade, and this is not that.

**D-C · New Mexico — where does it go?**
*Recommendation: **not in that release.*** New Mexico is a disclosure problem before it is a figure
problem. Its `excl65` is not stale and its note is not false; the note is accurate and misleading,
which is a harder thing to fix well. And the `ss: 0.5` blend is a modelling question that touches all
eight partial-SS states, not just NM. Handle NM in its own pass, after the RI/WI release, and expect
it to end in corrected copy rather than a moved figure.

**D-D · Should any figure move at all in the next release?**
*Recommendation: **yes, for RI and WI, and only the amounts** — `RI.excl65` 20000 → 50000 and
`WI.excl65` 5000 → 24000, with the notes corrected to name the FRA/67 floor as an unmodelled
condition.* Both are conservative moves toward the statute for the households that qualify. **Do not
attempt the age floors in the same release**: `exclAge` exists and would take RI and WI to 67, but
that interacts with the cliff and the IRA distinction in ways this round has not measured, and a
figure change plus a gate change in one release cannot be attributed if something moves.

**D-E · Does the Rhode Island $50,000 get asserted dollar-exact?**
*Recommendation: **yes for the $50,000 per-person amount; no for the AGI threshold.*** The $50,000 is
in the statute in plain terms. The **$133,500 / $107,000 pair should be dated to TY2025** wherever it
appears — the same treatment §B1a records for the MD/ME figures — because it is indexed annually and
TY2026 was not read. And **no dollar-exact figure for the $100,000 couple cap**, which rests on the
Division's guide rather than the statute (§2b).

## 7. What a build would have to carry — measured, not estimated

- **F-6 guarded set, executed against shipped v5.58 by `qa/tools/f6_probe.cjs`: 5 — NJ, NM, RI, VA,
  WI.** `t29` L212 selects it with `/income[- ]limited|income limit/i` over the note, and F-6 only
  asserts `length > 0`. **Rewriting RI's note can silently drop it and the suite stays green.**
  Re-execute the matcher against the final wording — a grep can find it and can never evaluate it.
- **Three whole-table constraints bind any new note**, all read from source this session: `t10` L467
  (every state with `excl65 > 0` names a `$` figure), `t10` L488 (every state with `ss > 0` matches
  `/social security|\bss\b/i` — **live for NM and RI, not for WI**), and F-6 itself.
- **`METHODOLOGY.md` names RI at L152** in the income-limits list *(NJ, VA, RI)* and **NM and RI at
  L128** among the eight partial-SS states. **Wisconsin appears nowhere.** Note that *"New Mexico"*,
  *"Rhode Island"* and *"Wisconsin"* appear **zero** times as names — the two-letter codes are the
  only handle. Any `t31` disclosure key requires a METHODOLOGY edit regardless: C-0 is ungated.
- **The suite contains no assertion naming NM, RI or WI at all.** An AST walk over every `Literal`,
  `TemplateElement`, regex node and member access across all thirty-two `t*.mjs` files returns
  **zero** references, by name, by code, or as `.NM` / `.RI` / `.WI`. There is no stale-copy lock to
  invert — and equally **no coverage whatsoever**. A negative control is mandatory before any claim
  that the release is witnessed (`OPERATIONS.md` §B2).
- **Version-bump cost is not four sites.** Re-derive with `node qa/tools/vercensus.cjs` against the
  new tag; it was not run this session because nothing was built.

---

**Sources.** N.M. Stat. § 7-2-5.2 and § 7-2-5.14 (2025 codification, with amendment histories);
N.M. Taxation and Revenue Department, *Legislative Summary: 2026* (corroborating the absence of a
2026 change); N.M. LFC fiscal notes to 2026 HB 92 and SB 156 (corroborating that current law retains
the caps). R.I. Gen. Laws § 44-30-12(c)(8), (c)(9) and (c)(11) with the section's full history of
amendments through P.L. 2025, ch. 278; R.I. Division of Taxation Publication 2026-01, *Retirement
Income Tax Guide*, issued February 2026 for Tax Year 2025 (load-bearing only for the per-person
reading of the couple cap, flagged at §2b, and for the TY2025 indexed thresholds); R.I. Division of
Taxation, *Summary of Legislative Changes*, 22 July 2026 (the TY2027 age-threshold removal).
Wisconsin carried from `AUDIT_STATE_EXCL65_ROUND3.md` §2b, not re-read.

All code, suite and baseline facts were printed by commands against the v5.58 tree at `3d7c205` in
the session dated above. The freshness check was run as a clone-and-compare in **both** directions:
106 of 108 pool files match repo content byte-for-byte, the two pool-only files are
`COMMIT_MESSAGE.txt` and `DangerClose-v5_57.jsx` (both expected), and no build input is repo-only.

**Destination: repo `docs/AUDIT_STATE_EXCL65_ROUND4.md` AND the knowledge pool** — same treatment as
its three predecessors, which are all in both places. It is referenced by `MissingFeatures.md` once
the D-number in §6 D-A is assigned, and it must be added to `PROJECT_KNOWLEDGE_INDEX.md` as a
manifest row.
