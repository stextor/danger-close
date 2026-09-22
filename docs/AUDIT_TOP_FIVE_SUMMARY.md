# Standing audit — the two-paragraph top-five summary

| Field | Value |
|---|---|
| Written | 2026-08-18 |
| Build | written against **v5.39** (`7070018f2699503dfac4ca8e0e1b2feb`, tree `a8e59f3`) · **RE-PINNED to v5.48 2026-08-25 — read that box first** |
| Draws on | Sections A–F: the `FlawsToFix-*` family, `MissingFeatures.md`, `ARCHITECTUREIssues.md`, `UsabilityFlaws.md`, plus the Phase 3 rollup, the v5.31 Section D sweep, the v5.28 2D break-even audit, and the v5.31 → v5.39 delta sweep |
| Spec | `SCOPE_STANDING_AUDIT.md`: *"provide a two-paragraph standalone summary of the top five most important issues, flaws, or problems from among all findings."* |

---

> ### ☑ REWRITTEN FOR v5.73 — 2026-09-15 · THE STANDING AUDIT RAN AGAIN, ALL FOUR PHASES · READ THIS BOX FIRST
> **✅ Post-audit update, v5.74 (2026-09-21):** the first issue below (C-8, E-21, D-14) is **fixed at v5.74** — the Taxes
> and IRMAA tabs now see the plan's spending withdrawals. E-21 is narrowed, not closed (see `ARCHITECTUREIssues.md`). The
> summary below is left as written.
>
>
> Build v5.73 · source `3bf1e15f1b28659aae9a78e3186d2ae8` · built `index.html` `345ccbceb58bf74f9fbdde5db0646d1d`. Drawn from
> `FlawsToFix-v5_73-Phase2.md` (Section C) and the v5.73 blocks of `MissingFeatures.md`, `ARCHITECTUREIssues.md` and
> `UsabilityFlaws.md` (Sections D–F). Phase 1 (Sections A–B) is `FlawsToFix-v5_69-Phase1.md` and its v5.72–v5.73 header
> notes. **The five below supersede the older lists in this document.**
>
> **The two paragraphs.** The most important problem is that **the Taxes tab and the Withdrawal plan project the same
> household separately, and the Taxes tab never taxes the Traditional money the plan spends**: on the shipped example it
> shows $0 federal tax in 2032–2038 while the plan draws about $238,000 from Traditional accounts, and it projects $1.63
> million of lifetime RMDs against the plan's $1.02 million — under a heading that calls itself "your projected tax life
> as-is" (C-8, E-21, D-14). Second, **on a phone the app does not fit**: one shell control forces every tab to about 566 px,
> so all 26 tabs scroll sideways at 390 px, and the header and tab grid fill the first screen so a tapped tab's content
> starts at its bottom edge (F-11, F-12, with F-1's absence of any breakpoint behind both). Third, **the same tax rule is
> implemented in several engines and fixes land in some copies only** — five §86 implementations (Engine A still carries
> the error v5.45 fixed elsewhere, C-4), two LTCG stackers that share a defect (C-6), four IRMAA tier comparisons that
> share an off-by-one at the top tier (C-1) — and no suite compares engines with each other or covers the households that
> expose these (E-22, E-25).
>
> Fourth, **two undisclosed tax errors reach mainstream households**: a surviving spouse under 65 is given the 65+
> deductions through the deceased spouse's age (about $976 of tax understated in the first survivor year of the worked
> case, C-3), and leftover standard deduction is not applied to dividends and capital gains, which overstates tax for an
> early retiree living off a brokerage account by up to 15% of the unused deduction (C-6). Fifth, **the default
> presentation is small for a 55-and-over audience**: visible text under 12 px on every tab at every size, 7–9 px on the
> Trajectory chart, and touch targets under 44 px for 27 of 30 controls on a typical tab (F-4 and F-3, unchanged since
> v5.38; the UI SIZE control mitigates, and since the v5.38 audit the Field Manual does point to it — F-10 is closed). Everything else the audit found is
> smaller, disclosed, or both — and every statutory constant in the app matched its primary source (Section C §1).

> ### ⚠ RE-PINNED TO v5.48 — 2026-08-25 · ITEM 1 IS LARGELY DISCHARGED, AND ITEM 5 JUST HAPPENED AGAIN
>
> Source `30ab12fba362b8ce538f66adea9a104b`, tree `ba6d598`. Nine releases since this summary was
> written. Verified **by content** — every `L####` below was re-resolved against v5.48, because the
> addresses in this document are v5.39 addresses and most have moved.
>
> **Item 1 — *"Disclosures drift off the engines beneath them"* — was ranked #1 "by a distance."
> Two of its three instances are now CLOSED and the third is half-closed.**
>
> | Instance | v5.39 | **v5.48** |
> |---|---|---|
> | **S-1** · IRMAA tab's MAGI sentence omits `div_y`, `capGain_y` | OPEN | ✅ **CLOSED, and closed structurally.** L9973 now reads *"…plus every other taxable component the plan generates, including dividends and realized capital gains."* Engine C sums seven components at **L4435**; the sentence is now a **catch-all plus two named examples rather than an enumeration**, so it cannot drift by omission the way it did |
> | **S-3** · `METHODOLOGY.md` says Engine B defaults gains to $0, present tense | OPEN | ✅ **CLOSED.** L678–680 is now past-tense and version-gated: *"Engine B applied the same simplification **through v5.35** … **From v5.36 that is no longer true and this parenthetical is historical**"* |
> | **D-6** · IRMAA SSA-44 relief | OPEN | ⚠ **HALF-CLOSED.** `METHODOLOGY.md` L840–845 now names SSA-44 **and work stoppage**. But `SSA-44`, `life-changing`, `work stoppage`, `appeal`, `redetermination` and `reassess` return **zero hits in the render tree and zero in the raw `DOCS_HTML`**. Creator-side closed; **user-side open — and user-side is where D-6 sets its own exposure** |
>
> **Ranking consequence.** Item 1 no longer belongs at rank 1 *as an open finding*. But the **pattern**
> it names is not discharged — the v5.48 Section D re-pin found two fresh instances of exactly this
> shape: **D-7**, where the only "we do not model estate tax" sentence is gated inside
> `if (_tlS.single)` so a couple never sees it, and **D-4**, disclosed in `METHODOLOGY.md` and absent
> from the Field Manual entirely. The instances close; the mechanism keeps producing new ones.
>
> **⚠ Item 5 has just demonstrated itself on this document.** Item 5's thesis is that *"the audit's
> own records went stale silently and hid completed work."* **S-1 and S-3 both closed silently, and
> this capstone went on ranking them #1 for nine releases.** That is the fourth and fifth silent
> closure on the same list as D-1, D-2 and C-2C-3 below — found the same way, during a records
> repair, not by any check designed to find it. **Item 5's case is stronger than when it was written,
> and on the evidence it now outranks item 1.** The ordering below is left as written rather than
> renumbered, because renumbering a superseded table hides what changed.
>
> **Citations re-resolved at v5.48** (item rows below still carry the v5.39 addresses):
>
> | What | v5.39 | v5.48 |
> |---|---|---|
> | S-1 · IRMAA tab MAGI sentence | L9792 | **L9973** |
> | Engine C MAGI sum | L4399 | **L4435** |
> | `STATE_RULES` | L1005–1057 | L1005–1057 *(unmoved)* |
> | `stateTaxAnnual` | L1091 | L1091 *(unmoved)* |
> | rendered per-state note | L11889 | **L12062** |
> | ACA panel | L9265 | **L9444** |
> | ACA strategy-table flag | L9302 | **L9480** |
> | ACA Verify assertion (sub-floor) | L1343 | **L1341** |
> | `OBBBA_CONSTS` | L931–937 | **L931** |
> | Engine D realized gain | L4742 | **L4779** |
> | Engine B `capGains_y` | L5096 | **L5140** |
>
> **Unchanged by this re-pin:** items 2, 3 and 4 hold as written. Item 2's D-3 correction stands and
> its census reproduces exactly at v5.48. Item 3's D-8b remains partial by a product decision already
> on the record. Item 4's F-1…F-9 were **not** re-verified here — `UsabilityFlaws.md`'s 2026-08-24
> pass found four of four tested claims stale, so **treat item 4's count as unverified until measured**.


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
> **What survives is the disclosure half** — ⚠ **and that half was itself corrected on 2026-08-20.**
> It was written up as six states collapsing a graduated schedule *silently*. They do not: the
> approximation is disclosed in the Field Manual twice and beneath the state selector on My Data for
> every jurisdiction (`src/DangerClose.jsx` L11889). What actually varies is how much detail each
> state's `note` adds — and only **three** states name progressivity (CA, DC, OR; Maryland was
> misfiled), against 30 whose notes say nothing about the shape of the schedule. That is
> **inconsistent per-state detail, severity Low.**
>
> **Consequence for this ranking.** Item 2 belonged this high *because* of the direction. With the
> direction corrected the precision half drops below the structural extinction assertion and E-7's
> version-ladder registry; with the disclosure half corrected too, **item 2 has no live high-priority
> half left at all** and should not be read as ranked second any longer.
>
> Full evidence and limits — only New York is verified against a sourced schedule, California is
> indicative, four states are unmeasured, and the exact count of silently-collapsed schedules is
> **unmeasured between 6 and 26** — in `AUDIT_D3_STATE_TAX_DIRECTION.md` §3.
>
> **This is the audit's own failure mode recurring:** the direction label was carried forward from
> v5.29 and ranked without ever being re-measured — not wrong when written so much as never checked.
> It surfaced during premise verification for a D-3 scope, which is where scope discipline is meant
> to catch exactly this.
>
> **And it recurred inside the correction.** The replacement claim — "undisclosed" — was inference,
> written in a session that had already read the disclosure text, and it stood for a day in four
> committed documents before being executed against source. A correction earns no credit in advance;
> it needs its own check. See `AUDIT_D3_STATE_TAX_DIRECTION.md` §6.

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
rate** — a simplification the app **does** disclose, in the Field Manual twice and beneath the state
selector on every jurisdiction. What is uneven is the per-state detail: three states (California, DC,
Oregon) name the progressivity in their own note and the rest do not, so a user comparing two states
reads different amounts about the same modelling choice. *(Corrected 2026-08-20; as first written this
sentence claimed six states disclosed nothing at all, which was false.)* **The ACA
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
| **2** | State schedules → single flat rate; **disclosed app-wide, but per-state `note` detail is uneven** | `DangerClose.jsx` L1005–1057 `STATE_RULES`, L1091 `stateTaxAnnual`, L11889 the rendered note | **Conservative** below ~$600–900K income — *direction corrected 2026-08-19; disclosure claim corrected 2026-08-20, see below* | **OPEN but LOW** (D-3) — **no longer belongs at rank 2** |
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
