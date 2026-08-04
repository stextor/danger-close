# Changelog

## v5.7.2

**Readability pass** (reported independently by AffectionateTap730 and scooter2013). No engine, schema, or persisted-field changes — if any number differs from v5.7.1, that is a bug; please report it.

- **Size floor raised.** The app's dominant text size was 8px, with 125 elements at 7px and four at 6px hiding in the claiming grid and IRMAA rows. New floor: nothing below 8px anywhere (guarded by a permanent test invariant); explanatory prose raised to 9px minimum (58 blocks).
- **Letter-spacing reduced on small text** (118 sites): wide tracking on 8–9px capitals was inflating letterform gaps ~25% at exactly the sizes where it hurts most. Headers at 10px+ keep their tracking — that's where it works.
- **What stayed uppercase, on purpose:** section headers, column headers, card titles, and status labels — the console identity one reviewer complimented. A census found the app's actual prose was already sentence case; the "wall of caps" experience came from the density of tiny tracked labels, which the size and tracking changes address directly.
- **Holdings table prepared for v5.8:** Ticker/Name/Asset columns narrowed to make room, and a dimmed **OWNER (v5.8)** teaser column now marks where per-spouse ownership will land — the answer to AffectionateTap730's #1/#2/#5 is scoped and next.
- Fonts verified: JetBrains Mono loads at weights 300–700, so no synthetic bolding was in play — the "thin" reading was size and tracking, now fixed.

Suite: 527 checks green (t1 234 · t2 44 · t3 56 · t4 160 · t5 24 · t6 9).

## v5.7.1

**Roth break-even rebuilt** (reported by AffectionateTap730). The old card divided undiscounted conversion tax by flat-24%-assumed RMD savings and rendered a hardcoded demo age (`63 + 12 + years`). It is replaced by a **WEALTH CROSSOVER** card under the strategy comparator: the slider strategy and NO CONVERSIONS both run through the full 30-year deterministic engine (brackets, SS taxation, NIIT, AMT, state, IRMAA lookback, ACA when configured), and the card reports the first year the strategy's after-tax wealth catches the no-conversion path — at **face value**, deliberately, so the cash question ("when does the tax I paid come back?") isn't masked by the heirs'-tax credit, which the ESTATE ranking captures separately. Discounting is implicit (same-year comparison ≡ discounting at the portfolio's growth rate) and the opportunity cost of conversion tax is mechanical: paid dollars leave the taxable balance in the engine and stop compounding. Four honest outcomes are distinguished: recovered after a deficit (with the deepest shortfall shown), never behind (early conversions under the standard deduction cost ~$0 — common before Social Security starts), never recovers within the plan (real for large conversions with little outside money — the demo household's FILL-24% loses the cash race by up to $514K while still competing on estate), and no measurable difference. Guarded by 11 exact-dollar engine tests including a case that pulls ahead precisely at RMD start.

Also in v5.7.1:
- **Pension lump-sum guard** (asked by Evening_Warthog): the monthly pension fields (My Data + Guided Setup) now warn when an entry above $25,000/mo looks like a lump sum, and point to the correct homes (Holdings row for a rollover; Other Accounts for after-tax cash). Previously a lump sum entered there silently modeled as that amount *per month, for life*.
- **Conversion-tax funding notice** (AffectionateTap730 #6): selecting "pay from cash/savings/brokerage" with almost no money outside retirement accounts now says the engine will fall back to paying from the Roth, then the Traditional — previously a silent fallback.
- **"Mixed" relabeled** to **"Trad + Roth (split)"** (AffectionateTap730 #3).
- **Stale Taxes-tab disclaimer corrected**: it claimed NIIT and AMT were not modeled (both are) and that state tax came from the master prompt (it uses the 51-jurisdiction module).

Suite: 523 checks green (t1 230 · t2 44 · t3 56 · t4 160 · t5 24 · t6 9).

## v5.7 — 2026-08

- **Fixed: overlapping input fields in My Data tables (reported by scooter2013, 4K displays).** Form inputs declared `width:100%` plus padding/border without `box-sizing:border-box` (the app has no global border-box rule), so each input rendered ~16px wider than its table cell and bled into the neighbor column at wide window widths. Fixed at all four affected style sites (both shared `inp` objects and the mortgage what-if RATE/TERM inputs); guarded by 7 new tests including a source-level invariant that no `width:100%`+padding form style may ever lack `boxSizing` again.
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
