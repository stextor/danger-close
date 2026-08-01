# Why is my success rate lower here than in other retirement calculators?

This is the most common question, so here's a standing answer. **A lower number here is not a bug — it's the entire point of the tool.**

Most mainstream calculators, at their default settings, will show a plan succeeding ~90–95% of the time. Danger Close will often show the *same plan* 10–20 points lower. That gap is deliberate, and it comes from a few design choices:

- **A pessimistic base scenario.** The default `BASE` prior is intentionally gloomier than the actual 1926–present historical record. Stress-testing means asking "what if the future is worse than the past?" — so the base case builds that in.
- **Regime-switching returns.** Instead of drawing each year from one tidy bell curve, the model switches between economic regimes (recession, crisis, stagflation, and so on). This produces fatter bad tails and more realistic clustering of bad years — which is exactly what breaks retirement plans in reality.
- **Explicit shocks.** Long-term-care events and stochastic longevity are modeled as real risks, not averaged away.

## What to try

Switch the scenario from `BASE` to **`HISTORICAL`**. That re-runs your plan against actual market history instead of the pessimistic prior. Comparing the two tells you how much of your result is *your plan* versus *the model's caution*. If your plan holds up under `BASE`, that's a genuinely robust plan.

The full reasoning, with sources, is in **[METHODOLOGY.md](../blob/main/METHODOLOGY.md)**.

---

*Reminder: don't post real financial figures in replies — use rounded or example numbers.*
