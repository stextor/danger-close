# Changelog

## v5.7 — 2026-08

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
