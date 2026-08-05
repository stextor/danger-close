# Changelog

## v5.9.2

**The save is now wherever you are** (follow-up to the v5.9.1 data-loss guard, from Steve's own field report).

The v5.9.1 flow had a friction bug: the leave-warning made you cancel, scroll to the bottom of My Data, and save — three steps to do the thing you obviously wanted. Two changes, no new data paths:

- **The sticky "unsaved changes" chip now contains a SAVE & APPLY NOW button.** The chip follows you down the page, so a save is always one click away from any section — no scrolling, ever. Its tooltip states plainly that it is identical to the main button at the bottom; every save in the app runs the same single commit path.
- **The leave warning is now a three-way choice: SAVE & APPLY, THEN LEAVE / DISCARD & LEAVE / STAY.** Saving from the dialog invokes the editor's own registered save function — the exact same `buildPortfolio()`/`buildExpenses()` commit as the buttons, nothing new serialized or stored, so there is no new surface that could leak. Discarding still leaves the auto-saved draft recoverable on your next visit, and the dialog says so.

Suite: 597 checks green (t1 287 · t2 44 · t3 66 · t4 171 · t5 24 · t6 9).

## v5.9.1

**Data-loss guard + contribution clarity**.

- **Unsaved My Data edits are no longer silently destroyed.** Previously, entering data and switching tabs discarded everything with no warning — the most severe reviewer finding to date, because the loss was invisible. Four layers now: an amber **● Unsaved changes** chip appears the moment you edit; leaving the tab while dirty asks first; closing the browser tab while dirty asks too; and — the real fix — a **draft auto-saves every few seconds** to separate storage, so on your next visit a banner offers RESTORE & APPLY DRAFT with a timestamp. Drafts never travel in backups (they're uncommitted by definition), die on Clear All Data, and yield to an imported backup. (The Clear All Data deletion was added by a pre-release leak review — the first cut cleared drafts on save and import but left them alive after "delete everything," which would have offered a "deleted" plan back to the next user of a shared machine.)
- **"Contrib %" renamed "Contrib split %"** with a tooltip and a smarter total readout. The column is how each year's contribution dollars *divide* across holdings — a split, not a savings rate — and the reviewer read it the other way because nothing said so. Verified during the build: totals that don't reach 100% are **scaled to the entered proportions** (60/40 and 6/4 are identical), and the readout now says exactly that; leaving every row blank makes contributions follow your current balance mix.
- **Import sanity clamps** (from the standing security audit): a hand-edited backup with an absurd retirement year or life expectancy could previously hang the tab, because engine loop bounds come from imported values. Years and life expectancies are now clamped to sane ranges on import, at the exact top-level fields the timeline reads.

Pre-tax vs Roth contribution modeling (the reviewer's third finding) is scoped separately as v5.10 — it's a real tax-engine feature, not a form fix.

Suite: 593 checks green (t1 283 · t2 44 · t3 66 · t4 171 · t5 24 · t6 9).

## v5.9

**Skins become interface personalities.** Previously a skin could change 18 color tokens and nothing else, so all eleven were the same tactical-console interface in different paint — which is why none of them satisfied. A skin now also carries **typography and density**: font family, label casing, type scale, letter-spacing, and table density.

- **REPORT** — sans, sentence case, roomier spacing, paper surfaces with a blue accent. The business-document register.
- **QUIET DARK** — the same typography on soft charcoal (deliberately not OLED black) with a desaturated blue accent. Evening reading without glare.
- **CONSOLE unchanged.** All eleven existing palettes declare `mono / caps / tight`, so anyone happy with Tactical Green sees exactly what they saw before, down to the pixel.

**The architectural change underneath:** 222 label strings were hand-typed in capitals, which CSS cannot undo without destroying acronyms (ACA, IRMAA, RMD). Labels are now stored in canonical **sentence case** — the lossless form — and the console personality re-applies uppercase via CSS. Casing is a real toggle now rather than a per-theme find-and-replace, and every acronym survived (protected-word list, reviewed as a diff).

A contrast invariant caught a real defect during the build: REPORT's first surface palette had panel and background too close to distinguish (1.04 ratio). Corrected before shipping.

Suite: 580 checks green (t1 273 · t2 44 · t3 66 · t4 168 · t5 24 · t6 9), including new invariants that every skin declares all five typography tokens, that the eleven legacy skins remain console-identical, and that the two new personalities share one spine.

## v5.8.2

**Update instructions corrected — the app now points at its own home.** Three places told users that getting a current copy meant asking whoever gave them the file, who might have to ask *their* source in turn, because "there is no download site yet." That stopped being true once the app went live on GitHub Pages. All three now name the site directly:

- the **⌛ STALE DATA banner** — the highest-impact one, since it is shown precisely to the users whose copy is out of date and who need the update path to work;
- the Field Manual §13 maintenance table;
- the §13 plain-English paragraph.

A permanent test invariant now fails the build if "person to person" or "no download site yet" reappears anywhere in the source.

Suite: 562 checks green (t1 251 · t2 44 · t3 66 · t4 168 · t5 24 · t6 9).

## v5.8.1

**Per-person displays completed + header decluttered.**

- **STEP-1 RMD cards rebuilt per-person** (gap found by the v5.8 headless ownership-flip verification): each spouse's own Traditional now grows to *that spouse's* first RMD year and divides at *that person's* starting divisor, shown as two stacked figures with each person's age and year — for the demo couple, 2039 and 2041 instead of one pooled figure at 2039. The with-conversion card replays the ladder per person using the engine's own proportional-allocation rule.
- **Withdrawal-tab schedule: two RMD streams.** Each spouse's slice starts RMDs at that person's own SECURE 2.0 age. Owner shares are held at their initial proportions in this schedule view (the Roth engine reallocates dynamically) — stated here rather than implied. The "RMDs active" phase and legend now name both ages. This closes the v5.8 staging note, which is deleted rather than amended.
- **Header decluttered:** the animated allocation radar is gone — it duplicated the allocation strip below it, its caption still described a retired grading version ("Ring = target … Number = deviation" on a radar that had neither), and its sweep redrew at 60fps on every tab for the whole session, so removal is also a battery/CPU fix. The scanline (the slow-moving horizontal line) is gone too. The header is ~100px shorter; the success rate keeps its size and becomes the top-right's sole focus.

Suite: 558 checks green (t1 247 · t2 44 · t3 66 · t4 168 · t5 24 · t6 9).

## v5.8

**Per-spouse ownership**. The largest engine change since the merge.

- **Every retirement holding now has an OWNER.** The Holdings table's Owner column (teased in v5.7.2) is live, labeled with your household's names. Other Accounts gain an owner too, with **Joint** available there — and only there, because IRAs and 401(k)s are individual by law.
- **RMDs run as two streams.** Each spouse's Required Minimum Distributions start at *their own* SECURE 2.0 age (73 for 1951–59 births, 75 for 1960+) on *their own* balance. Previously the entire household pot took RMDs at Spouse A's age — overstating early RMDs and understating the conversion window for mixed-age couples. The Events tab always announced two RMD dates; the engines now agree with it.
- **Conversions are per-person.** A conversion lands in the converter's own Roth — there is no such thing as a spousal conversion, and the model no longer implies one. Each spouse converts only inside their own window (retirement → the year before their own RMDs); the household ladder runs to the LATER of the two, so a younger spouse's dollars stay convertible after the older spouse's window closes.
- **Solver allocation is proportional to convertible headroom** — a representation choice, not advice; per-spouse sequencing (e.g. draining the older spouse first) is deliberately not optimized and is documented as such.
- **Survivor rollover:** on the first death, the decedent's retirement accounts roll to the survivor (the standard spousal election) and the survivor's own RMD age governs the merged pot from then on. Joint taxable simply continues.
- **Old backups migrate safely:** retirement rows default to Person A with a one-time review notice in My Data; other accounts use their names as hints ("(A)", "Spouse B …") and default to Joint. Saving writes explicit owners and clears the notice.

Suite: 542 checks green (t1 242 · t2 44 · t3 66 · t4 163 · t5 24 · t6 9), including 10 new hand-verified per-spouse cases: RMD-at-own-age to the dollar, window legality, proportional allocation, survivor rollover (merged pot correctly waits for the survivor's age), and a pooled-fallback equivalence proof that keeps every pre-v5.8 test meaningful.

## v5.7.2

**Readability pass**. No engine, schema, or persisted-field changes — if any number differs from v5.7.1, that is a bug; please report it.

- **Size floor raised.** The app's dominant text size was 8px, with 125 elements at 7px and four at 6px hiding in the claiming grid and IRMAA rows. New floor: nothing below 8px anywhere (guarded by a permanent test invariant); explanatory prose raised to 9px minimum (58 blocks).
- **Letter-spacing reduced on small text** (118 sites): wide tracking on 8–9px capitals was inflating letterform gaps ~25% at exactly the sizes where it hurts most. Headers at 10px+ keep their tracking — that's where it works.
- **What stayed uppercase, on purpose:** section headers, column headers, card titles, and status labels — the console identity one reviewer complimented. A census found the app's actual prose was already sentence case; the "wall of caps" experience came from the density of tiny tracked labels, which the size and tracking changes address directly.
- **Holdings table prepared for v5.8:** Ticker/Name/Asset columns narrowed to make room, and a dimmed **OWNER (v5.8)** teaser column now marks where per-spouse ownership will land — the answer to AffectionateTap730's #1/#2/#5 is scoped and next.
- Fonts verified: JetBrains Mono loads at weights 300–700, so no synthetic bolding was in play — the "thin" reading was size and tracking, now fixed.

Suite: 527 checks green (t1 234 · t2 44 · t3 56 · t4 160 · t5 24 · t6 9).

## v5.7.1

**Roth break-even rebuilt**. The old card divided undiscounted conversion tax by flat-24%-assumed RMD savings and rendered a hardcoded demo age (`63 + 12 + years`). It is replaced by a **WEALTH CROSSOVER** card under the strategy comparator: the slider strategy and NO CONVERSIONS both run through the full 30-year deterministic engine (brackets, SS taxation, NIIT, AMT, state, IRMAA lookback, ACA when configured), and the card reports the first year the strategy's after-tax wealth catches the no-conversion path — at **face value**, deliberately, so the cash question ("when does the tax I paid come back?") isn't masked by the heirs'-tax credit, which the ESTATE ranking captures separately. Discounting is implicit (same-year comparison ≡ discounting at the portfolio's growth rate) and the opportunity cost of conversion tax is mechanical: paid dollars leave the taxable balance in the engine and stop compounding. Four honest outcomes are distinguished: recovered after a deficit (with the deepest shortfall shown), never behind (early conversions under the standard deduction cost ~$0 — common before Social Security starts), never recovers within the plan (real for large conversions with little outside money — the demo household's FILL-24% loses the cash race by up to $514K while still competing on estate), and no measurable difference. Guarded by 11 exact-dollar engine tests including a case that pulls ahead precisely at RMD start.

Also in v5.7.1:
- **Pension lump-sum guard** (asked by Evening_Warthog): the monthly pension fields (My Data + Guided Setup) now warn when an entry above $25,000/mo looks like a lump sum, and point to the correct homes (Holdings row for a rollover; Other Accounts for after-tax cash). Previously a lump sum entered there silently modeled as that amount *per month, for life*.
- **Conversion-tax funding notice** (AffectionateTap730 #6): selecting "pay from cash/savings/brokerage" with almost no money outside retirement accounts now says the engine will fall back to paying from the Roth, then the Traditional — previously a silent fallback.
- **"Mixed" relabeled** to **"Trad + Roth (split)"** (AffectionateTap730 #3).
- **Stale Taxes-tab disclaimer corrected**: it claimed NIIT and AMT were not modeled (both are) and that state tax came from the master prompt (it uses the 51-jurisdiction module).

Suite: 523 checks green (t1 230 · t2 44 · t3 56 · t4 160 · t5 24 · t6 9).

## v5.7 — 2026-08

- **Fixed: overlapping input fields in My Data tables.** Form inputs declared `width:100%` plus padding/border without `box-sizing:border-box` (the app has no global border-box rule), so each input rendered ~16px wider than its table cell and bled into the neighbor column at wide window widths. Fixed at all four affected style sites (both shared `inp` objects and the mortgage what-if RATE/TERM inputs); guarded by 7 new tests including a source-level invariant that no `width:100%`+padding form style may ever lack `boxSizing` again.
### ACA premium subsidy modeling (new)
- **My Data → ACA BRIDGE**: enter your household's benchmark silver premium ($/mo) and FPL household size. Blank = feature off; pre-v5.7 backups import cleanly and default to off.
- **Roth tab**: strategies are now charged for the marketplace subsidy they destroy in pre-Medicare bridge years (new **ACA SUB LOST** column, charged against the taxable balance so estates reflect it). The NO CONVERSIONS row loses $0 by construction.
- **STAY UNDER ACA CLIFF** strategy: bridge years convert up to 400% of the prior-year FPL minus other ACA income minus a $500 margin; post-Medicare years fill the 24% bracket.
- **Law scenario toggle**: CURRENT LAW (the 400%-FPL cliff that returned when the enhanced credits expired end-2025) vs ENHANCED EXTENDED (the ARPA 8.5%-cap structure, should Congress restore it). Persisted like the SS depletion scenario. Under ENHANCED the cliff solver is hidden — no cliff exists to stay under.
- Modeling notes: ACA MAGI counts **full** Social Security (the untaxed part adds back — a different MAGI than IRMAA's); bridge premiums grow at household inflation + 2 points (medical trend); years with one spouse already on Medicare use half the household premium; below 100% FPL the model shows $0 and defers to Medicaid rules it does not model.
- Constants verified against primary sources at build time: IRS Rev. Proc. 2025-25 (2026 applicable-percentage table), HHS/ASPE poverty guidelines (2025 and 2026 vintages), Rev. Proc. 2021-36 (ARPA table for the ENHANCED scenario). 8 new checks on the in-app Verify tab (53 total).

### Since v5.6 (merged build)
- Income streams as a first-class module (rental / work / annuity / other; owner, window, COLA, tax treatment) flowing through every engine.
- Verify tab: every statutory constant asserted against IRS/CMS/SSA on-screen.
- Social Security trust-fund depletion scenario (year + percentage) threaded through all engines and the claiming grid.
- First-open disclaimer gate, baked into the build template so rebuilds can't drop it.
- Fixed: Monte Carlo percentile bands broke under stochastic longevity (post-death snapshots were recorded quarterly instead of annually).
- Fixed: SS-tab spousal-benefit sentence asserted a comparison it never computed; now computed, with an explicit "spousal benefit not modeled" disclosure when it governs.
- Roth what-if slider cap raised $120K → $400K (no IRS limit exists; solver strategies were never capped).
- Four readability skins (High Contrast Light/Dark, Midnight Blue, Colorblind-Safe Okabe–Ito) with WCAG contrast enforced by tests; UI scale control (100–150%); landing-screen readability hint.
- Backup-filename guidance and gitignore-aligned default name.
