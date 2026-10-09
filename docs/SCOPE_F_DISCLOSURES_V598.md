# SCOPE — three undisclosed usability simplifications, and the glossary's order (v5.98)

**FULFILLED — shipped as v5.98 (2026-10-08).** Repo-only. §7 is the build record.

*(Superseded status line, retained:)* **READY — 2026-10-08.** Steve: "continue", after the census of the C/E/F registers recommended this release (2026-10-08). Under his standing
instruction every decision below carries a recommendation the build takes and records. **A PRESENTATION release** — no engine changes, no
figure moves, METHODOLOGY unchanged.

## 0 · Premise (verified against v5.97, not assumed)

Freshness: repo `106b2d8` (census ops package on v5.97), full clone; source `4157137a9ce50db365a1a190fa10f617` = repo = pool (hashed through the
Projects tool, 2026-10-08); built `42c082a242cb157ee6de8044f5ca9db8`. Pool 125 (Projects listing).

The census (`UsabilityFlaws.md`, "Census at v5.97") found four simplifications the app does not disclose, though the v5.40 status block said v5.39
had: v5.39's §13 (commit `d18f7cc`) named none of them. Read by parser on v5.97:
- **F-5** — 42 JSX `title` attributes; 41 are hover tooltips (one is the Docs iframe's accessible name). A touch screen has no hover.
- **F-7** — the Trajectory chart's draw effect reads `chartRef.current.clientWidth` once per run; its dependencies are
  `[current, retireYear, hoveredQ, showGuardrails, activeTab]`; the source has no `ResizeObserver` and no `"resize"` listener. So a resize or a phone
  rotation leaves the chart at its old width until something in that list changes — leaving the tab and coming back does.
- **F-9** — the Docs tab shows the Field Manual in an `iframe` of `height: "74vh"`: a scroll box inside the page's scroll.
- **F-16** — the glossary is alphabetical except one pair: "API Key" sits before "Agency MBS" (case-insensitive order puts "Agency" first). The
  trailing "Authoritative sources" entry is a deliberate footer, not a term.

## 1 · Decisions (taken on recommendation)

- **F1-1 — disclose F-5, F-7 and F-9** in Field Manual §13's "Designed for a desktop browser" item, one dated sentence (v5.98), with the work-around
  for the chart (leave the tab and come back). Fixing them is larger than disclosing them and each needs a browser to verify; the rule is
  "disclosed in-app, never silent", which disclosure satisfies. *Alternative:* fix F-7 with a resize listener — deferred; it needs real-browser
  tests (`t47`-style) to be worth claiming.
- **F1-2 — fix F-16:** swap the two entries. No disclosure needed.
- **F1-3 — the disclosure is held to the code** (OPERATIONS §B2: a disclosure assertion becomes a lock the moment its disclosure becomes false). `t62`
  asserts each clause together with the code fact that makes it true — tooltips exist, no resize handling, the iframe still scrolls — so a future
  fix turns `t62` red and forces the sentence to be removed in the same release.
- **F1-4 — the registers:** `UsabilityFlaws.md`'s census table marks F-5, F-7 and F-9 *open, disclosed v5.98* and F-16 *fixed v5.98*.

## 2 · Site census (AST)

Source: one Field Manual sentence (inside `DOCS_HTML`, anchored on "the UI SIZE control helps there.") and the two glossary entries; the four version
sites. Suites: any assertion on the §13 item's text or the glossary's order or count is found by running the suite (the literal census of `t4`'s
Field Manual checks is the run).

## 3 · Tests

New suite **`t62_desktop_disclosures.mjs`**, both legs (v5.97 pins the absence):
- **A** the §13 sentence on v5.98 (absent on v5.97), each clause paired with its code fact (F1-3);
- **B** EXTINCTION: the glossary's terms in case-insensitive order, the footer excluded and asserted last; a guard that the term count is ≥ 70 so a
  broken parser cannot pass vacuously;
- **C** no engine moved: MC parity (`t2`) stays 10/10 with no declared diff.
Controls `qa/tools/controls_v598_disclosures.py` (repo-only).

## 4 · Out of scope

Fixing F-5, F-7 or F-9; F-15b (the "$1,500K" vs "$1.25M" labels); the Field Manual's own small print; the device and screen-reader passes.

## 5 · Stop conditions

Stop and report if: any engine fingerprint moves; the run shows a suite asserting the old glossary order on purpose; a clause cannot be paired with
a code fact.

## 7 · Build record (v5.98, 2026-10-08)

- **Source** `240f5ae6e56bd5d5662891ceec60fbbb` (6 anchors, each once on v5.97: the §13 sentence, the glossary pair, four version sites). **Built** `11518a499200afb433f11bcb23a2317b` (v5.97 rebuilt
  byte-identical first; `smoke_built` 22 passed, 0 failed).
- **Stop conditions:** none fired — MC parity 10/10 with no declared diff; no suite asserted the old glossary order; every clause paired with a fact.
- **`t62`** 12 (v5.98) / 9 (v5.97). **Controls 7 of 7.** The glossary has 78 terms plus the footer (the census said 79 entries,
  footer included).
- **Found at registration:** v5.97's six single-tag ternary gates were invisible to `register_tag2`; converted to arrays (OPERATIONS records the shape).
- **Suite:** 5,275 app checks, 61 suites, 0 failed, 0 DIED; GRAND 5,405. Run from the PACKAGED copies as two concurrent halves, the method approved at v5.87: run folders built by mk_runfolder.sh v597 v598 from a full clone of 106b2d8 with the github/ files overlaid (v5.97 resolved from history, commit ba46635), each through a session-only copy of runsuite.sh whose one added line skips the other half's labels. Half A GRAND 5183, half B GRAND 222; none DIED.
