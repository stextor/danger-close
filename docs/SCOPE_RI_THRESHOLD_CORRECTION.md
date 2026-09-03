# SCOPE — Rhode Island's note states a threshold the statute does not admit

| Field | Value |
|---|---|
| Premise verified against | **v5.60** · source `23877f903a14ba43dd707a43d98b0df4` · tree `e1f7adb` |
| Written | 2026-09-03 |
| Origin | `AUDIT_STATE_INCOME_BASES_ROUND5.md` §2e and §8 |
| Shape | **Disclosure only. One string. No figure the engine reads moves. No engine change.** ⚠ **But NOT a one-line release — see §2, the suite pins the old figure literally.** |
| Status | **FULFILLED** — built and shipped as **v5.61**, 2026-09-03. §6 resolved: D-a ship alone, D-b (iii). §7 is the build record. |
| Precedent | `SCOPE_VA_NOTE_CORRECTION.md`, shipped v5.58. Same shape, same class, same verification pattern. |

---

## 1. Premise, verified against the statute and against the build

**The modelled note states a Rhode Island AGI threshold that Rhode Island's own indexing formula
cannot produce.**

`STATE_RULES.RI.note` (AST-resolved at **L1068** of v5.60, not grepped) contains:

> `... a hard AGI cliff (TY2025: $133,500 MFJ/$107,000 single) ...`

### The two official sources disagree

| source | date | TY2025 single / HoH / MFS | TY2025 MFJ |
|---|---|---|---|
| **ADV 2025-22** | 3 Nov 2025 | $107,000 | **$133,750** |
| **PUB 2026-01** Retirement Income Guide | Feb 2026 | $107,000 | **$133,500** |

Both are Rhode Island Division of Taxation publications, both read in full on 2026-09-03. PUB 2026-01
states $133,500 **nine times** — its §1c threshold table, §3, §5's preamble, and worked examples 2, 4,
5, 6, 8, 9 and 10. It is later and it is the filing-season guide, which is why the project adopted it,
and why this is not a careless error to have made.

### The statute settles it, and it settles against the app

**R.I. Gen. Laws § 44-30-12(c)(8)(i)–(v)**, reproduced in PUB 2026-01 itself, sets base-tax-year-2000
amounts of **$80,000** (single/HoH/MFS) and **$100,000** (MFJ/QW), adjusts both by **one** cost-of-living
factor, and rounds each increase **down to the next lower multiple of $50**.

- **TY2024 confirms the mechanism exactly**: $104,200 ÷ $80,000 = $130,250 ÷ $100,000 = **1.3025**.
- Given the verified TY2025 single figure of **$107,000**, the factor lies in **[1.3375, 1.33813)**.
- The implied MFJ raw increase is **$33,750.00 to $33,812.50**, rounding down to $33,750 or $33,800.
- **The admissible MFJ threshold is therefore $133,750 or $133,800. $133,500 is not admissible** — it
  would require the MFJ threshold to be a smaller multiple of the same factor than the single one.

$133,750 is admissible **and** preserves the exact 1.25 ratio TY2024 confirms. **ADV 2025-22 is right.
PUB 2026-01 carries a typo it then repeated nine times.**

### Direction and blast radius

**No computed output changes.** The cliff is not modelled, so no code path reads this figure — it
exists only in the disclosure. Confirmed: the only consumer of `RI.excl65` is `stateTaxAnnual`'s
`_cap`, and the threshold appears nowhere but the note string.

**But it ships.** The figure is in the source note, therefore in the built `index.html`, therefore on
the live site. A user checking the app against Rhode Island's own TY2025 guide will find $133,500 and
conclude the app is wrong — which is why the corrected note must say *why* it differs, not merely
state a different number.

---

## 2. Site census — run, not grepped (§B1)

Code claims by AST (`qa/tools/state_dump.cjs`); suite claims by reading the assertion; prose by
literal search, which is not a census and is not covered by §B1.

| site | what | count |
|---|---|---|
| `STATE_RULES.RI.note` **L1068** | the wrong figure, user-facing | **1** |
| built `index.html` | carries it via the source | 1 (falls out of the rebuild) |
| `DangerClose-v5_59.jsx` | ⚠ **frozen prior leg — DO NOT EDIT** | 1 |
| **`t10_taxcases.mjs` L873** | ⚠ **asserts the literal string** — see below | **1** |
| `t31_disclosure_parity.mjs` | RI key is built on the **$50,000 statutory amount**, not the threshold — **verify, do not assume unaffected** | ~L255 |
| `CHANGELOG.md` | 2 historical entries | ⚠ **do not rewrite** |
| `METHODOLOGY.md` | 1 | |
| `MissingFeatures.md` | 1 | |
| `SCOPE_EXCL65_STALE_RI_WI.md` | 1 | retired scope; correct with a dated note |
| `AUDIT_STATE_EXCL65_ROUND4.md` | 3 | correct with a dated note |

**9 prose occurrences across 6 documents, plus the shipped source. `$133,750` appears nowhere.**

### ⚠ THE THING THAT MAKES THIS NOT A ONE-LINE RELEASE

`t10_taxcases.mjs` **L873**, gated at `_v >= 559`, runs on **both legs**:

```js
T("[DISCLOSED v5.59] RI's note names the IRA exclusion and the AGI cliff, dated to TY2025",
  /IRA/.test(R.RI.note) && /cliff/i.test(R.RI.note) && /TY2025: \$133,500/.test(R.RI.note) ? 1 : 0, 1);
```

The regex pins the **literal old figure, including its `TY2025: ` prefix**. Change the note and the
**current leg fails**; leave the assertion alone and the correction cannot ship. And the frozen v5.59
and v5.60 legs legitimately carry $133,500 and must keep passing.

**This is exactly the v5.27 mistake that OPERATIONS §B2 exists to prevent**: asserting a correction
against a frozen prior build. The remedy is the **version-gated split** already used eight lines above
it for the `exclAge` change (L865–871):

```js
if (_v >= 561) { /* [FIXED v5.61] assert the corrected figure */ }
else           { /* [KNOWN DEFECT pre-v5.61] assert the old figure as the pre-fix pin */ }
```

⚠ Whatever wording §3 lands on **must still satisfy the three other live matchers**, none of which
may be broken in passing:

- `/IRA/` and `/cliff/i` — L873's siblings.
- `/income[- ]limited|income limit/i` — L893's by-decision pin **and** `t29` L212's F-6 empty-set
  guard. **RI is one of only four states holding that set open.** Dropping the phrase would silently
  shrink it, which is the defect F-6 was written to catch.
- `/full retirement age/i` and `/\b67\b/` — L866's `[APPLIED v5.60]` pin.
- `/\$50,000/` — L862's extinction pin.
- `/\$\d/` — §2E's whole-table note guard at L467.

**Run the matchers against the drafted string before editing the source, not after.**

---

## 3. What this ships

1. **`STATE_RULES.RI.note`** — the figure corrected to **$133,750**, with a clause saying why it
   differs from Rhode Island's own guide. Draft for review, not for pasting unchecked:

   > `... a hard AGI cliff (TY2025: $133,750 MFJ/$107,000 single per ADV 2025-22 — RI's own TY2025
   > guide prints $133,500, which the statute's indexing formula does not admit) ...`

   with the rest of the existing note unchanged.
2. **Version bump to v5.61** — footer, DATA LOAD header, Field Manual callsign, Field Manual footer.
   t1's STATIC checks assert all four.
3. **`t10` L873 split into a gated pair** per §2, with the pre-v5.61 branch pinning the old figure.
4. **`t31`** — verify the RI disclosure-parity key still fires; adjust only if the census shows it must.
5. **`CHANGELOG.md`** — a v5.61 entry recording the conflict between the two RI publications and the
   arithmetic that resolves it. ⚠ **Historical entries are NOT rewritten** — they were true as
   published.
6. **`METHODOLOGY.md`**, **`MissingFeatures.md`**, `AUDIT_STATE_EXCL65_ROUND4.md`,
   `SCOPE_EXCL65_STALE_RI_WI.md` — corrected with a dated note rather than silently.
7. **Rebuild `index.html`** and hash-verify shipped jsx == canonical == build input.

⚠ **`METHODOLOGY.md` is required here.** This is a presentation-only change by output, but it
corrects a **statutory** claim, and the v5.42/v5.43 entries establish that the statute governs.

---

## 4. Explicitly out of scope

- **The income-conditioning field.** `SCOPE_INCOME_CONDITIONING.md`, gated on D-2/D-3.
- **Modelling the RI cliff.** This release does not make the threshold live; it corrects what the app
  *says* the threshold is. The two are separable and bundling them destroys attribution.
- **Connecticut**, and its `ss: 0.5` finding.
- **RI's FRA-by-birth-year nuance.** ROUND5 §2e confirms `exclAge: 67` is right for anyone born 1960
  or later and conservative by at most ten months for a 1955–1959 cohort. **No change warranted**; a
  clause could say so, but only if it does not push the note past legibility.
- **RI's TY2026 thresholds** — not published until November 2026.
- **RI's military-pension modification**, and the IRA distinction, which the note already discloses.

---

## 5. How it will be verified

- **Full suite, both legs, green.** The v5.59 leg must be **unchanged** at 1,111 and the v5.60 leg at
  1,119 plus whatever the gated split adds; parity 10/10.
- ⚠ **A negative control, read individually per §B2**: revert the note figure to $133,500 against the
  v5.61 leg and confirm the `[FIXED v5.61]` assertion **fails**. An assertion that cannot fail is the
  defect this project has caught in its own tests twice.
- **A second negative control**: confirm RI still matches the F-6 income-limited matcher after the
  rewording, by executing `t29` L212's regex against the new string — not by reading it.
- `package_check` before and after, remembering `J-1`/`J-2` fail before an upload and `D-1` after, all
  correct by construction.
- `smoke_built` against the rebuilt artifact.

---

## 6. Decisions for the maintainer

**D-a · Does this ship on its own, or ride with the income-conditioning field?**
Riding along is cheaper by one version bump. Shipping alone gives the correction its own CHANGELOG
entry, which matters more than usual here because the entry has to explain that a state's own
publication is wrong — that is not a footnote inside a larger release.
**Recommendation: ship alone as v5.61.** Same argument the scope uses against bundling the `ss: 0.5`
blend: attribution.

**D-b · How much of the "why" goes in the note?**
The note is already the longest in the table. Options: (i) the full clause drafted in §3; (ii) figure
only, with the explanation in `METHODOLOGY.md`; (iii) a short middle — `per ADV 2025-22`.
**Recommendation: (iii).** It gives a user who checks the app against RI's guide a citation to
follow, without a second sentence about a typo inside a state-rule note. The full account belongs in
`METHODOLOGY.md` and the CHANGELOG.

**D-c · Do we tell Rhode Island?**
Their published guide contains an error a user could act on. Out of the project's scope, and entirely
your call.
**Recommendation: no project position.** Noted here so it is a decision rather than an oversight.

---

## 7. Build record — built and shipped 2026-09-03 as v5.61

**Shipped.** Source `7e1a02881256142c5b9206045e76e2ec` · built `index.html`
`ba3968f24e06eb989d9171cbd9a8c796`. Decisions taken as recommended: **D-a** ship alone as v5.61,
**D-b (iii)** `per ADV 2025-22`, **D-c** no project position.

**Counts, computed from suite output:** v5.61 leg **1,121** · v5.60 leg **1,119** (unchanged, as §5
required) · run-once **670** · parity **10/10** · **2,920 app checks, 0 failing**. Tooling 82.
`smoke_built` 16/16.

### ⚠ Correction to this scope's own §2

**§2 attributes its code census to `qa/tools/state_dump.cjs`. No such file exists.** `qa/tools/`
holds twelve `.cjs` files and that is not among them. The census was re-derived for the build by AST
(`STATE_RULES` resolved from a `VariableDeclarator` walk) and **its substance was correct**: `RI.note`
resolves at **L1068**, the figure appears once in the source, and `$133,750` appeared nowhere.
`f6_probe.cjs` and `notes_probe.cjs` both do this class of work and either could have produced it.
The finding is provenance, not arithmetic — but §A0's standard is that a sentence carrying a number
names the command that printed it, and this one named a command that cannot be run.

### What §3 shipped, item by item

1. **The note** — corrected to `$133,750 ... , per ADV 2025-22` per D-b (iii). `133,500` now appears
   **0** times in the source.
2. **Version bump** — 4 in-app sites, found and replaced by count, 0 stale strings remaining. Suite
   cost re-derived rather than quoted: `vercensus` measured **78 judgement points** (59 chain arms,
   16 ladder members, 3 ternaries). The three ternaries were handled by hand: `t1`'s `verStr` and
   `t4`'s `_badge` took **new arms**; `t24`'s `_k` ends a chain and took an **extension**. `t10`
   needed no registry roll — it derives `_v` numerically.
3. **`t10` L873** — split at `_v >= 561`, plus two new v5.61-only checks (extinction of `133,500`,
   and a pin on the citation).
4. **`t31`** — **verified unchanged, and the suite decided it, not the builder.** `t31`'s own header
   states the key set is deliberately small and that *"widening it is a scope, not a convenience."*
   The RI key binds `$50,000 pension/401k exclusion`, which this release does not touch. Only the
   version registries rolled. A `$133,750` key was considered and rejected on that instruction.
5. **`CHANGELOG.md`** — v5.61 entry added; the two historical entries are **not** rewritten.
6. **`METHODOLOGY.md`** (full derivation), **`MissingFeatures.md`**, **`AUDIT_STATE_EXCL65_ROUND4.md`**
   (3 sites), **`SCOPE_EXCL65_STALE_RI_WI.md`** — all corrected with dated notes, not silently.
   `SCOPE_INCOME_CONDITIONING.md` already carried its correction from the audit session.
7. **Rebuild** — see below.

### §5 verification, and what it turned up

- **The matchers were executed before the source was edited**, not after. Exactly one verdict flipped:
  the `$133,500` pin. F-6's guarded set held at **four (NJ, NM, RI, VA)** with RI in it.
- **A whole-suite AST sweep** (§B1a; `suite_regex_probe.cjs`, 376 regex literals) found a **second**
  flip: `t29_boundaries.mjs` L112's `/75/`, because `$133,750` contains `75`. Read and adjudicated
  innocent — it tests an RMD-age row that never sees a state note. It is the false-positive class
  §B1a warns about, and it was read rather than assumed.
- **Six negative controls** (`qa/controls_v561.sh`), one more than §5 asked for. **C5 is not in this
  scope**: it falsifies the *pre-v5.61* pin on the frozen v5.60 leg, proving the gated split is a
  split and not an inversion. It fires.
- ⚠ **C2 came back NOT CAUGHT on its first run, and the verdict was correct.** Nothing pinned
  `ADV 2025-22`, so the clause D-b exists to provide could have been deleted without the suite
  noticing. Per §B2 the control was not adjusted — an assertion was added. That is the +1 taking the
  leg from 1,120 to 1,121. The control's *label* was separately wrong (written expecting silence
  while left at `EXPECT=fail`), which is the same defect `controls_v560.sh` records making at its C0.

### ⚠ An arithmetic refinement this scope did not have

ADV 2025-22's own **TY2024 MFS** figure is **$104,225** — an increase of $24,225, a multiple of $25,
not $50. Rhode Island's practice therefore deviates from the stated rounding rule somewhere, which
weakens a bare "$50 rounding" argument. **It does not rescue $133,500.** Stated as a ratio bound
instead: under any rounding convention the two thresholds' ratios to their bases can differ by at
most ~0.0006, and $133,500 implies 1.3350 against the single's 1.3375 — a gap four times too large.
The verdict holds; the argument is simply better made as a ratio bound than a $50 bound, and
`METHODOLOGY.md` and the CHANGELOG state it that way.

### ⚠ Build reproducibility — `mammoth` had moved

§N3a's prior-release check **failed on first run**: rebuilding v5.60 from its own unmodified source
gave `fd2f302ed8351c665c936571b99446fd` against the published `278cb053b93f4b389c99f1e1ad31b591`.
Per §N3a the tree was suspected before the source, and correctly: the first differing bytes sat inside
vendored `mammoth` code (`Object.create(null)` vs `{}`), and `mammoth` resolves through an unpinned
`^1.8.0` caret. It had advanced to **1.12.2**. Pinned to **1.12.1** (`--no-save`, so `package.json`
stays byte-identical to knowledge), v5.60 reproduces **exactly**.

v5.61 was then built against that pin, which buys a stronger provenance claim than a hash alone:
**applying this release's five textual edits to the v5.60 artifact reproduces the v5.61 artifact
byte-for-byte.** The artifact diff is provably nothing but the intended change. A committed lockfile
remains the real fix (§N3a says so) and is not this release's work.

### Open items this build leaves behind

- The `state_dump.cjs` provenance error above, corrected here.
- **`OPERATIONS.md` §B1a's F-6 membership list is stale.** It records "NM, RI, VA, WI remain" from a
  v5.54 pass; the set at v5.60/v5.61 is **NJ, NM, RI, VA**. That paragraph is explicitly a dated
  record so this is drift rather than contradiction — but it reads as current.
- `ri_probe.cjs`, written for this build, is **session-only** and deliberately not shipped. Its home
  is the deferred `qa/tools/` ops package, not a release it would be verifying.

---

*Destination: `docs/SCOPE_RI_THRESHOLD_CORRECTION.md` in the repo, and the knowledge pool.*
