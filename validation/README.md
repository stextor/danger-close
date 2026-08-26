# Danger Close — Validation Suite

**This is NOT the release gate.** `OPERATIONS.md` §I is, and it requires the `qa/` suite,
`smoke_built` and `package_check` — not this. `validation/` is the older, separate public-constants
suite, kept deliberately for a different purpose (§B). Nothing here gates a release, and a release
that has not run it is not incomplete.

**Last verified 2026-08-25 against v5.49** (`2ccc62b669f6ee52c6a0be1709c967a5`). Both layers were
actually executed to write this file — the previous version documented commands that could not run.

---

## 1 · Statutory constants — `node validation/check_constants.mjs`

**48 checks, 0 failing at v5.49.** No setup, no build step, no dependencies: it reads
`src/DangerClose.jsx` as text.

Asserts the 2026 federal figures (standard deductions, every ordinary bracket edge for both filing
statuses, LTCG brackets, NIIT thresholds), the QCD cap, the state-module invariants (exactly 8
partial-SS states, exactly 9 no-tax states, 51 entries, rate bounds, IL/PA exemptions, GA exclusion,
WV phase-out), and the Gompertz longevity sampler's median-anchoring property — **each with its
citation**.

⚠ **This layer is not redundant with `qa/`.** It asserts constants the suite does not touch —
`SGL_LTCG`, `SGL_NIIT`, the partial-SS state count, and the QCD cap among them. If you are
tempted to delete it as duplicated coverage, check that list first.

## 2 · Behavioral suites — headless app tests (jsdom + React)

Build a test, then run it through the runner:

```bash
npx esbuild validation/smoke_entry.jsx --bundle --format=cjs --platform=node \
  --jsx=automatic --external:jsdom --outfile=/tmp/val_smoke.cjs
TEST_MODE=selfhosted node validation/run.cjs /tmp/val_smoke.cjs
```

### Measured per test, 2026-08-25 at v5.49 — **five of six run, one is broken**

| Test | Result at v5.49 |
|---|---|
| `smoke_entry.jsx` | ✅ **26/26 tabs, 0 runtime errors** · 2 forbidden-term hits (see below) |
| `qcd_test.jsx` | ✅ Roth-tab QCD pointer shown; no runtime errors |
| `banner_test.jsx` | ✅ diagnostics line present; example mode → amber, red suppressed |
| `byok_test.jsx` | ✅ direct-browser-access header set; forget clears storage |
| `share_test.jsx` | ⚠ runs and passes, but prints `[undefined]` where the other tests print `[selfhosted]` — it reads the mode differently. Cosmetic as far as measured, **not** investigated |
| `deep_test.jsx` | ❌ **CRASHES.** `[solve] RUN button present: false`, then `TypeError: Cannot read properties of undefined (reading 'click')`. The Roth solve-for UI moved and the test still drives the old one |

⚠ **Do not read "the behavioral layer works" from this.** Five tests work. `deep_test` — the one
covering state-module ordering (TX=IL < GA < CA lifetime tax), the Roth solve-for grid and the Monte
Carlo toggles, i.e. **the only modelling-shaped assertions in this directory** — has been driving a
button that is not there. Everything it claims to check is currently unchecked, and it fails loudly
rather than silently, which is the one good thing about it.

Repairing it means re-deriving the current selectors against v5.49 and is **out of scope for the
2026-08-25 revival**, which deliberately did nothing but make the runner load and the documentation
true.

### ⚠ Three corrections made 2026-08-25 — the old README could not be followed

- **The runner is `run.cjs`, not `run.js`.** `package.json` declares `"type": "module"`, so node
  treats a `.js` file as ESM and refuses this CommonJS runner outright: *"require is not defined in
  ES module scope."* **The behavioral layer could not run at all**, and the rename is the entire
  fix — the file is byte-identical. It was broken by a packaging change, not by anything in the app.
- **The filenames are `snake_case`.** The old text named `smoke.entry.jsx`, `deep.test.jsx` and a
  `*.test.jsx` glob. The files are `smoke_entry.jsx`, `deep_test.jsx`, `*_test.jsx`. Nothing matched.
- **26 tabs, not 25.** The app grew one and this file did not notice.

### ⚠ Two open items, deliberately not fixed here

- **`smoke_entry` reports 2 forbidden-term hits at v5.49.** The rule is `/bucket|glide/i`, guarding
  the vocabulary decision against "bucket strategy" and "glide path" language. Both hits are
  *descriptive* prose about Traditional and Roth buckets, on the my-data and withdrawal tabs — not
  the marketing sense the rule was aimed at. Whether the copy changes or the regex narrows is a
  product-vocabulary call for the maintainer, so both were left alone.
- **`run.cjs` is a tenth jsdom environment.** Section E's finding E-6 counts nine, which is correct
  for `qa/` — nine files there call `new JSDOM` directly. Project-wide the figure is **ten**. Every
  trap that must hold in the `qa/` copies applies here too, and this copy has never been audited
  against them.

---

**Honest scope note.** This suite validates statutory constants and app behavior. It does **not**
constitute independent professional review of the tax mathematics, and golden-file cross-validation
against Pralana/ProjectionLab remains future work (see `METHODOLOGY.md` §12).
