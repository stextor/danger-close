# AUDIT — `DOCS_HTML` (the Field Manual) against shipped behaviour

**Read-only audit. No source was modified.** Findings only; any fix gets scoped separately.

| Field | Value |
|---|---|
| Date | 2026-08-12 |
| Build audited | **v5.27** · `5e1e81566fe4101eaf6bf584e38b1830` (committed tree, HEAD `1eeee96`) |
| Artefact | `DOCS_HTML`, source line 3436, 141,245 raw chars / 141,216 unwrapped |
| Structure | 82 headings · 16 numbered sections · 26-tab reference table · glossary |
| Method | HTML unwrapped from the string literal, section-mapped, claims checked against source and against the suite's own assertions |

**Verdict: no user-harmful falsehood remains.** The v5.27 correction did its job. What the audit
found instead is a **coverage** problem — the manual is accurate where it speaks and silent where it
matters most — plus one section that is twenty releases stale.

---

## Confirmed CORRECT (checked, not assumed)

| Claim | Verified against |
|---|---|
| "The 26 Tabs at a Glance" · "re-derives all 26 tabs" ×3 | `t4` asserts `tabs().length === 26` and passes. **Correct.** |
| The "What you enter" Holdings row | v5.27 text; matches `OTHER_TAX_TYPES` and the engine behaviour exactly |
| Data-vintage table (2026 brackets, IRMAA, wage base $184,500, RMD 2022 table) | Matches the Verify tab, which `t10` re-checks against IRS Rev. Proc. 2025-32 / CMS / SSA |
| OBBBA "senior bonus" declared NOT modelled, omission called conservative | Correct, and correctly signed |
| §13 tax/state/mortality/LTC/benchmark limitations | All still accurate at v5.27 |
| Roth conversion-tax funding narrative (§07) | Still accurate — v5.26 changed *which* money counts as available, not the three funding cases described |

The one place v5.26/v5.27 touched is right. The manual is not lying to anyone.

---

## FINDING 1 — the Withdrawal Strategy tab entry still describes the pre-v5.26 model

**Severity: medium. User-visible, and the same class of defect v5.27 just fixed.**

§07's Withdrawal Strategy entry reads, in full:

> Three sections: the year-by-year schedule, the account-priority order (**Taxable → Traditional →
> Roth**, with an 8-step order-of-operations), and a 3-strategy comparison.

That priority order is now incomplete in a way that matters. The **first** priority is not "Taxable"
— it is the Other-accounts pot, which since v5.26 contains Traditional, Annuity, Roth and HSA money
taxed by type. A reader of this entry would not learn that the pot exists, that it is drawn first,
or that what they entered there is now taxed.

This is **not** a false statement; it is the pre-v5.26 description surviving in a section nobody
edited. v5.26 corrected the Withdrawal *tab* itself and the My Data panel, and v5.27 corrected the
"What you enter" table — but the tab's own **manual entry** was never in any of those censuses,
because all three were driven from the source sites the release touched.

**Root cause worth naming:** the release censuses were `otherAccounts`-identifier censuses. A
narrative description of a behaviour contains none of the identifiers, so an AST census can never
find it. Copy is found by reading, not by tooling.

---

## FINDING 2 — §13 Limitations omits every v5.26 modelling simplification

**Severity: medium. This is the section a careful user reads to calibrate trust.**

§13 is thorough and honest about brackets, state tax, mortality, LTC, benchmarks, and the OBBBA
omission. It says **nothing** about the Other-accounts model, and v5.26 introduced five disclosed
simplifications that belong there. All five are already written up in `METHODOLOGY.md`:

1. A draw from the first-priority pot is taxed **in proportion** to what the pool holds, not by
   draining one tax type before another.
2. **HSA is modelled as tax-free throughout**, though it is only tax-free for qualified medical costs.
3. An **annuity is part after-tax basis**; the single label cannot express it, so all of it is
   treated as ordinary income (pessimistic direction).
4. A **qualified annuity inside an IRA does have an RMD** and will be mis-classified by name
   inference; the field is user-correctable and the notice names changed rows.
5. **Unclassifiable account names default to Traditional**, which over-taxes an unrenamed brokerage
   account.

The asymmetry is the finding: METHODOLOGY is complete, the Field Manual is silent, and the Field
Manual is what users actually read.

---

## FINDING 3 — "What's new in v5.7 / v5.7.1 (this build)" is twenty releases stale

**Severity: low for correctness, high for credibility.**

§01 carries a heading that says **"(this build)"** and then describes v5.7 and v5.7.1 as the current
release. The app is v5.27. Everything in the section is historically true — ACA subsidy modelling,
the Guided Setup wizard, Simple Mode, the 51-jurisdiction state module, the Roth optimizer — and
none of it is the *newest* work.

Version references across the whole manual: `v5.7` ×3, `v5.7.1` ×3, `v5.27` ×2, `v5.26` ×2,
`v5.25` ×1. The three most recent releases — the ones that changed how a user's money is taxed —
appear only inside the single passage v5.26/v5.27 edited.

For a tool whose stated identity is candour about its own limits, a manual that announces v5.7 as
"this build" undercuts the thing the rest of the document is trying to earn. It also means a user
looking for "what changed" finds a section that will not tell them their numbers moved.

---

## FINDING 4 — a structural weakness, not a defect

The three copy corrections in v5.26/v5.27 all landed because someone went looking for a specific
sentence. **Nothing in the suite or the tooling can find a narrative description that has quietly
become incomplete.** `t4`'s docs assertions check for specific strings; `qa/tools` resolves
identifiers. Neither can answer "does §07 still describe what Engine D does?"

That is not solvable by a test. It is solvable by a **release checklist item**: when a release
changes modelling, list the Field Manual sections that describe the changed behaviour and read them.
For v5.26 that list would have been §07 Withdrawal Strategy, §07 Taxes, §08 My Data, §13
Limitations, and the §01 what's-new — of which one was edited.

---

## Recommendation

**One release, presentation-only, three edits.** Roughly the size of v5.27:

1. Rewrite §07's Withdrawal Strategy entry to name the first-priority pot and its tax treatment.
2. Add the five v5.26 simplifications to §13, copied down from `METHODOLOGY.md` so the two cannot
   drift.
3. Replace the §01 what's-new section with one covering v5.22–v5.27, and drop "(this build)" from
   the heading in favour of an explicit version.

Plus the checklist item from Finding 4 in `OPERATIONS.md` §I.

**Not recommended:** a wholesale Field Manual rewrite. The document is in better shape than these
findings suggest — 16 sections audited, one stale, two incomplete, zero false. The failure mode here
is omission, and omission is cheap to fix once located.

## What this audit did NOT cover

- The **glossary** (§15, ~14,000 chars) was not checked term by term.
- §10's **API-key and Ask AI** material was not re-verified against current behaviour.
- §14's **FAQ** was spot-checked only.
- No claim was checked against a **primary tax source**; the data-vintage table was verified against
  the Verify tab, which is itself asserted by `t10` — so this is second-hand and adequate for a
  documentation audit, not a substitute for `t10`.
