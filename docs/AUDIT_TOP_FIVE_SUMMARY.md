# Standing audit — the two-paragraph top-five summary

| Field | Value |
|---|---|
| Written | 2026-08-18 |
| Build | **v5.39** · source `7070018f2699503dfac4ca8e0e1b2feb` · tree `a8e59f3` |
| Draws on | Sections A–F: the `FlawsToFix-*` family, `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `UsabilityFlaws.md`, plus the Phase 3 rollup, the v5.31 Section D sweep, the v5.28 2D break-even audit, and the v5.31 → v5.39 delta sweep |
| Spec | `SCOPE_STANDING_AUDIT.md`: *"provide a two-paragraph standalone summary of the top five most important issues, flaws, or problems from among all findings."* |

---

> ### ⚠ ERRATA — line citations corrected 2026-08-19
>
> **Every `L####` citation into `src/DangerClose.jsx` in this document was originally one line low.**
> The working copy used for the analysis had the single-line `DOCS_HTML` literal (L3593) deleted so
> that greps would not dump the Field Manual — a documented technique — but the resulting line
> numbers were then quoted as though they came from the unmodified file. Everything at or below
> L3593 was unaffected; everything above it was short by exactly one.
>
> **All citations here are now corrected and each was re-resolved against the shipped source**
> (`7070018f2699503dfac4ca8e0e1b2feb`) by confirming the cited line contains the code it claims.
> **No finding, figure, or conclusion changes** — the anchors were always the right code, described
> correctly; only the addresses were wrong.
>
> The error is recorded here rather than only in chat, per the project's rule on owning errors in
> the deliverables. It is the same shape as the failures this audit already documents: a derived
> artifact mistaken for the primary source. It was caught by re-deriving the anchors from the
> original file rather than by re-reading the analysis.


> ### ⚠ CORRECTION — item 2's direction was wrong, measured 2026-08-19
>
> This summary ranked D-3 **second**, and the stated tiebreaker was that it is *"the only open
> simplification that is not reliably conservative"* — that it under-taxes and can flatter a plan.
> **Measurement against v5.40 shows the opposite for the population this app is built for.**
>
> New York, MFJ, both 67, against the sourced 2026 schedule (Form IT-2105-I; $16,050 MFJ standard
> deduction; $20,000/person pension exclusion): at **$120,000** of retirement income the model charges
> **$4,800** where New York charges **$3,121** — **54% too high**. The model **over-taxes at every
> income up to roughly $600,000** and only reverses somewhere between **$600,000 and $900,000**, far
> outside "a mainstream couple within sight of retirement." Engine figures were executed, not
> inferred; hand arithmetic matches to the dollar.
>
> **Two causes:** `stateTaxAnnual` models **no state standard deduction** at all, and each flat rate
> approximates a mid-to-upper *marginal* rate rather than an effective one.
>
> **What survives is the disclosure half**, and it is better founded: six states collapse a graduated
> schedule silently while four disclose it — a real inconsistency whichever way the arithmetic points.
>
> **Consequence for this ranking.** Item 2 belonged this high *because* of the direction. With it
> corrected, the **disclosure half stays** (undisclosed is undisclosed) but the **precision half drops
> below** the structural extinction assertion and E-7's version-ladder registry, both cheaper and both
> making every later release safer.
>
> Full evidence and limits — only New York is verified against a sourced schedule, California is
> indicative, four states are unmeasured — in `AUDIT_D3_STATE_TAX_DIRECTION.md`.
>
> **This is the audit's own failure mode recurring:** the direction label was carried forward from
> v5.29 and ranked without ever being re-measured — not wrong when written so much as never checked.
> It surfaced during premise verification for a D-3 scope, which is where scope discipline is meant
> to catch exactly this.

## The summary

Across every phase of this audit the most consequential defect has not been a wrong number — it has
been **a sentence that stopped matching the engine underneath it**. The pattern recurs in five
separate places and it is the top finding by a distance: the IRMAA tab tells users its MAGI is built
from five income components when the engine sums seven, having been left behind twice in the same
sentence, first by dividends and then by the realized capital gains that v5.36 and v5.38 existed
specifically to feed it; `METHODOLOGY.md` still states in the present tense that the Taxes engine
defaults realized gains to zero, false since v5.36 and contradicted by a later section of the same
document; and the SSA-44 disclosure covers a surviving spouse's appeal while saying nothing about
work stoppage, which is the trigger that actually applies to a household that has just retired. For
an app whose entire contract with its user is *"it reports what the model computes, never advice,"*
the disclosures are the only way anyone can know what was computed — so prose drifting off the
engines attacks the product at its foundation, not at its edges. Ranked below that are three live
modelling and interface gaps. **The largest open taxation gap, now that the two above it have
closed, is that progressive state income-tax schedules are approximated by a single effective flat
rate**, and six of those states — Hawaii, Minnesota, New Jersey, New York, Vermont and Wisconsin —
collapse a graduated schedule with no note admitting it, while California, DC, Maryland and Oregon
disclose exactly the same approximation, so a user comparing two states cannot tell they are reading
the same kind of estimate. **The ACA
sub-floor remains a live trap**: below 100% of the federal poverty level the app prints $0 because
Medicaid governs there and is not modelled, indistinguishable on screen from the $0 the statute
produces above the subsidy cliff, so a single dollar of MAGI across that line swings the modelled
subsidy by nearly an entire benchmark premium and inverts any comparison spanning it — measured at 6
of 24 bridge years across six reconstructed households, two of them below 51% of FPL, so this is a
routine sight rather than an edge case. And **nine small-screen usability defects, F-1 through F-9,
were disclosed at v5.39 but not fixed** — layout, contrast, touch targets, tooltips, input modes and
chart resize — on the surface a first-time visitor is most likely to arrive through.

The fifth item is different in kind, and the case for ranking it this high is that it has already
done more damage than anything above it: **the project's instruments for knowing its own state have
failed repeatedly, and their silence keeps being read as good news.** Three recorded instances have
a test probe die or a patch no-op while the suite reported green — a control harness run from the
wrong directory, a fingerprint probe calling a function on the wrong object, a control that patched
source but never rebuilt the bundle it was measuring — which matters disproportionately here because
*"nothing ships without the full test suite green"* is this project's central ship gate, and a gate
that cannot distinguish a passing check from a dead one is not a gate. Its documentary half is worse.
The audit's own records went stale silently and hid completed work: **three of the highest-ranked
findings in this audit — the false OBBBA disclosure, the absence of realized capital gains on
ordinary drawdown, and a HIGH, explicitly non-conservative defect in which the Taxes engine computed
a widow's required distributions from her dead husband's age — were all fixed by releases that never
touched the documents recording them**, and were discovered still sitting at the top of the open list
four to eleven releases later, during a records repair rather than through any check designed to find
them. Two completed audit phases were likewise recorded as outstanding because the documents proving
them lived in the repository while the manifest indexed only project knowledge, which cost a session
to rediscover. The honest reading is that this audit's bookkeeping has been its least reliable
component, and that its most valuable output is not any single defect but the demonstration that
**every one of these failures was caught by executing a check rather than by reasoning about what the
code probably did** — a lesson the audit learned by getting findings wrong in both directions first.

---

## The five, with evidence

| # | Issue | Where | Direction | Status |
|---|---|---|---|---|
| **1** | Disclosures drift off the engines beneath them | `DangerClose.jsx` L9792 vs L4399 (S-1); `METHODOLOGY.md` L537–538 vs L5096 (S-3); `METHODOLOGY.md` L696–699 (D-6) | Understates conservatism; the one instance that overstated it (D-1) is fixed | **OPEN** — S-1, S-3, D-6 |
| **2** | State schedules → single flat rate; **six states do not disclose it** | `DangerClose.jsx` L1005 ff. `STATE_RULES`, L1091 `stateTaxAnnual` | **Conservative** below ~$600–900K income — *corrected 2026-08-19, see below* | **OPEN** (D-3, disclosure half) |
| **3** | ACA sub-floor $0 reads as computed | ACA panel L9265, strategy-table flag L9302, Verify assertion L1343 | Both — inverts comparisons across the line | **PARTIAL** (D-8b) — flagged v5.32, discontinuity remains |
| **4** | Nine small-screen usability defects | `UsabilityFlaws.md` F-1…F-9 | User-side | **OPEN** — disclosed at v5.39, unfixed |
| **5** | Verdict instruments and records both fail silently | `ARCHITECTUREIssues.md` E-19 (High), E-20, E-14/E-18 | Creator-side, compounding | **PARTIAL** — `qa/controls.sh` adopted; records repaired 2026-08-18 |

### The three silent closures, verified at v5.39

| Finding | Severity as recorded | Closed by | Verified |
|---|---|---|---|
| D-1 · OBBBA disclosure false in two places | **High** | disclosures rewritten; constants moved to `OBBBA_CONSTS` L931–937 with P.L. 119-21 §70103 citations | Field Manual and `METHODOLOGY.md` L120 both now accurate |
| D-2 · No realized gains from ordinary drawdown | Med-High, **optimistic** | **v5.36** | Engine D L4742–4742 → Engine B L5096 → both tax engines L9427–9433, L9710–9712 |
| C-2C-3 · Post-death RMDs keyed to the deceased spouse | **HIGH, non-conservative** | not attributed to a release in the documents | Engine B L5071 does the spousal rollover; L5078–5080 keys `rmdA`/`rmdB` to each person's own age; `tradBal` survives only as a pooled view |

### Method and limits

Every claim above was checked against the shipped v5.39 source or the committed tree, by locating the
engine expression that implements it. **Nothing here was measured by driving the engines**, so the
figures quoted from earlier documents (the 6-of-24 bridge years, the $89,673 → $194,928 depletion
delta) are reported as those documents measured them, not recomputed. Severity and direction labels
are carried forward from the originating findings rather than re-derived. No suite was run; no source
was changed; v5.39 stands.

**One records defect found while writing this and not yet fixed:** `ARCHITECTUREIssues.md` uses the
identifier **E-15 twice**, at L624 (the MC-parity fingerprint household is premium-zero) and L756 (the
`taxOrd` growth omission, fixed at v5.37). Only the second is discharged. Citing "E-15" is currently
ambiguous.
