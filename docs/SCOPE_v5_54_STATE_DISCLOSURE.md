# SCOPE — v5.54: the state exclusion notes say what the model does, not what the law is

> ## ⛔ RETIRED — BUILT AND SHIPPED AS v5.54, 2026-08-29
>
> All four §6 decisions were resolved (two amended; see the CHANGELOG and the stop-report §1) and the
> release shipped. Its `package_check` OPEN-allowlist entry was deleted in the same edit, per §L.
> **Kept, not deleted, per §G's "prefer retiring to deleting".** Two things it got wrong are worth
> carrying forward: its §4 site census priced the suite cost as *"`t31` gains one key"* against an
> actual **62 gated expressions and 14 registries**, and it did not foresee that rewording NJ's note
> would drop it out of `t29`'s `state_excl_limited` boundary set. Both are recorded in
> `docs/FINDINGS-v5_54-session-2.md` and `OPERATIONS.md` §B1a.


| Field | Value |
|---|---|
| Premise verified against | **v5.53** · source `12a007ed8e57a391acba67b799eb5a2f` · tree `49fcffa` |
| Written | 2026-08-28 |
| Origin | `AUDIT_STATE_EXCL65_NOTES.md` — four of six states checked misstate their own law to the user |
| Shape | **Disclosure only. No modelling change. No figure moves. Parity must stay 10/10.** |
| Version | **v5.54 — a bump. Four in-app version sites.** |
| Status | **Awaiting decisions in §6 — do not build yet** |

---

## 1 · Premise, verified

**The defect is on two surfaces, not one.** The audit found the in-app notes wrong. Checking
`METHODOLOGY.md` §6 for this scope found **the same errors creator-side**:

| Surface | What it says |
|---|---|
| `STATE_RULES.NJ.note`, rendered at **L12103** | *"up to $75K/person — INCOME-LIMITED (~$150K)"* |
| `METHODOLOGY.md` **§6**, L131 | *"NJ up to $75K income-limited"* — **the same wrong fact** |
| `METHODOLOGY.md` **§6**, L138–141 | *"income limits on several exclusions (NJ, VA, RI approximated as unconditional)"* — discloses the **income-limit** class only |

So the income-limit approximation *is* disclosed creator-side. **The Social Security offset is
disclosed nowhere, on either surface** — and it is the mechanism in three of the four defective
states (MD, ME, CO). `t31` has no key for it, which is why nothing caught the omission: `t31` asserts
parity for limitations `METHODOLOGY.md` *claims*, and it claims this one nowhere.

**The generated clause is a separate defect from the note.** L12103 renders, for all 19 states with
`excl65 > 0`, a clause built from the model's own parameter:

```jsx
`· $${(STATE_RULES[stateCode].excl65 / 1000).toFixed(0)}K/person 65+ exclusion`
```

This asserts a modelling parameter as a legal fact. For NJ it reads *"$75K/person"* when NJ has **no
per-person exclusion at all**. Correcting a note does not touch it, and a corrected NJ note would sit
beside a clause contradicting it.

## 2 · What this ships

**A · Reword the generated clause to describe the model, not the law.** One place, all 19 states,
and it is the change that makes every corrected note coherent:

| | |
|---|---|
| now | `· $75K/person 65+ exclusion` |
| proposed | `· model applies $75K/person 65+ exclusion` |

This is the app's stated identity applied literally — it reports what the model computes. It also
means the NJ clause stops being false without needing a per-state exception.

**B · Correct the four verified notes.** Drafted below; wording is a §6 decision.

| | Draft |
|---|---|
| **NJ** | `$100K HOUSEHOLD exclusion at 62+, phased down above $100K income and gone above $150K; modelled as $75K/person unconditional — overstates it` |
| **MD** | `state+county effective; $40,600 pension exclusion 65+ (2026), reduced by Social Security received — not modelled; traditional IRA does not qualify — not modelled` |
| **ME** | `$48,216 pension deduction (indexed to the SS maximum), reduced by Social Security received and phased out above $250K MFJ — neither modelled` |
| **CO** | `$24K 65+ cap covers Social Security AND pension together — they do not stack; modelled as separate, which overstates it` |

**C · A standing caveat beside the clause**, because 13 states remain unverified and correcting four
notes must not imply the other 15 were checked:

> `State exclusion rules are approximations and several are not modelled in full — see the Field
> Manual. Verify against your state's rules.`

⚠ **No count in the UI.** *"6 of 19 verified"* would be accurate today and stale at the next audit —
the `OPERATIONS.md` §E failure exactly. The count lives in the audit and the CHANGELOG, which are
dated; the UI carries the standing property.

**D · `METHODOLOGY.md` §6.** Correct the NJ fact, and add the SS-offset class to the *Not modeled*
list — it is absent today. Note §6 currently lists the eight partial-SS states as **CO, CT, MN, MT,
NM, RI, UT, VT** while also saying CO's 65+ *"may deduct all federally-taxed SS"*; `STATE_RULES.CO`
carries `ss: 0.5`. **That internal contradiction is flagged, not resolved here** — see §5.

**E · `t31` gains one key, and `ORDER` gains `v554`.**

## 3 · ⚠ The `t31` key is the part most likely to ship broken

`t31` matches **literal substrings** in raw source and raw `DOCS_HTML`. Three of its six existing
keys nearly shipped vacuous, and its header records each. Two traps apply here:

1. **The key must be an exact substring of the shipped copy.** Draft B writes MD as *"reduced by
   Social Security received"*, which contains `reduced by Social Security`. Writing it as *"reduced
   dollar-for-dollar by Social Security"* — the phrasing the statute uses and the more natural
   sentence — **would not contain the key** and `t31` would go red against correct copy.
2. **The key must not already be present, or it passes before the fix exists.** Measured this
   session: `reduced by Social Security`, `Social Security offset` and `offset by Social Security`
   all return **0 hits in `METHODOLOGY.md` and 0 in source**. `the model applies` returns **1 in
   source** — so it is *not* safe as a key, and item A's wording must not be keyed on.

**Proposed key: `reduced by Social Security`**, `since: "v554"`, why: *"three of the four verified
exclusions are reduced by Social Security and the model applies none of that."* Pre-v5.54 legs
assert its **absence**, per the house pattern.

⚠ **The build must run the negative control before believing the key** — write the key into
`METHODOLOGY.md` only, confirm `t31` goes red, then write the user side and confirm green. That is
the control that caught the v5.51 and v5.52 keys.

## 4 · Site census

| File | Change |
|---|---|
| `src/DangerClose.jsx` **L12103** | generated clause reworded (A) + standing caveat (C) |
| `src/DangerClose.jsx` **CO L1034 · ME L1048 · MD L1049 · NJ L1059** | the four note strings (B). ⚠ **Resolved by `census.cjs` at v5.53, and this row was WRONG on two of the four when first drafted from memory** (it read L1052/L1055 for ME/MD). Caught by running the tool before shipping the scope. Line numbers move every release — **re-resolve, do not trust these** |
| `src/DangerClose.jsx` — 4 version sites | footer, DATA LOAD header, Field Manual callsign, Field Manual footer → **v5.54** |
| `src/DangerClose.jsx` — `DOCS_HTML` §13 | Field Manual limitations gains the SS-offset sentence ⚠ **one 149,000-char line — quote-free anchors, exclude from greps** |
| `METHODOLOGY.md` §6 | NJ fact corrected; SS offset added to *Not modeled* (D) |
| `qa/t31_disclosure_parity.mjs` | one key; `ORDER` gains `v554` |
| `CHANGELOG.md`, `PROJECT_KNOWLEDGE_INDEX.md`, `TESTING.md` | release mechanics |

**Not touched:** `stateTaxAnnual` · `STATE_RULES` rates, `excl65`, `ss`, `retExempt` values ·
`boundaries.mjs` · any engine.

## 5 · Explicitly out of scope

- **Modelling the SS offset.** That is the question this scope answers with disclosure instead. It
  needs a signature change (`ssGross`, absent today though both engines bind it — Engine A L3829,
  Engine B L5119) and a per-spouse `persons65` replacement. Its own scope, later.
- **The 13 unverified states.** Their notes are left exactly as they are. Item C is what keeps that
  honest.
- **CO's `ss: 0.5` versus its note.** Flagged in §2D and in the audit; resolving it is a *modelling*
  question, and this scope changes no model. **Do not quietly reword the note to match `ss: 0.5`** —
  that would make the disclosure agree with the code by describing the code, which is the opposite of
  the point.
- **Rates.** GA's stepping-down 5.19% and every other `rate` remain unverified.

## 6 · Decisions — Steve

**D-a · The four note rewrites, as drafted in §2B.** RECOMMEND as written. They name the real figure,
the real mechanism, and the direction of the model's error. **Read them as user-facing copy** — they
are the whole deliverable and I would rather you edit them now than after the suite is green.

**D-b · The generated clause (§2A).** RECOMMEND `model applies …`. *Alternative:* suppress the clause
for states whose shape does not match, which needs a per-state flag and leaves the model silently
disagreeing with itself in 19 places instead of saying so once.

**D-c · Does `METHODOLOGY.md` §6 keep naming example states?** It currently lists seven by name, of
which only GA and NY are verified. RECOMMEND keeping the list but marking which are verified,
because deleting it would remove information rather than correct it.

**D-d · Version.** v5.54, and it **is** a bump — four in-app sites, `t1` STATIC asserts them, and the
prior-leg pair rolls to v553 → v554. Confirming rather than assuming, since the last scope's D4 was
ratified backwards.

## 7 · Tests and the ship bar

Full suite both legs, parity **10/10** (it is 10, not the 9 that `OPERATIONS.md` §E carried until
today), `t1` STATIC version strings, the new `t31` key with its negative control run, `smoke_built`
against the rebuilt artifact, `package_check` on the zip.

⚠ **`t4` walks the DOM and the state selector is in it.** Items A and C change rendered text, so `t4`
and the DOM diff may move legitimately. **A moved figure there is expected; a moved figure anywhere
else is not** — and the DOM diff's ±$500 render ceiling means it cannot see this release at all,
so a STRICT reading of "nothing moved" is not evidence of correctness here. `t31` is the witness.

⚠ **This is a source change, so §E's parity guardrail is the hard line.** A disclosure release that
moves any engine fingerprint has overreached — stop and narrow it.
