# SCOPE OF WORK — Standing Code Audit

**Purpose:** a reusable audit specification. Run it against any build; it produces four planning documents plus a standalone summary. Written to be pasted verbatim at the start of a session.

**How to run it:** this is a **multi-session** audit — Section C alone is a full session of hand-verified case construction. Run one phase per session (see *Execution order*), and start each session by stating the build under audit: **version number and source hash**, so findings are pinned to a specific artifact.

---

## THE PROMPT (paste this)

> Thoroughly analyze this code for the following potential problems. List the problem and, where possible, the suspected cause, in `.planning/FlawsToFix.md`.
>
> **A. Creator-exposure flaws.** Any user-exploitable flaw that might expose the code's creator to issues: increased costs, denial-of-service, hijacks, failure to validate arguments, and failure to halt.
>
> *Examples of the class I mean:* "a malicious user is able to hijack an AI key for their own unrestricted use" (this exact check found exactly that flaw in another developer's code); "a user is able to poison the backend email-ID database"; "a user is able to cause an injection into the code that can be leveraged for malicious purposes."
>
> **B. PII exposure.** Any leaks, or probable leaks, of Personally Identifiable Information that exist today or could be created by exploiting a flaw.
>
> **C. Numerical validation — to within one dollar.** Validate these flows:
> - State and federal tax for **single** *and* **married-filing-jointly** filers. Test border cases: tripping IRMAA brackets, NIIT, capital gains.
> - Roth conversion **break-even** accounting. Does the analysis use reliable financial-accounting technique?
> - **Proper** inflation (at CPI) of federal and applicable state tax brackets, and IRMAA.
> - **Improper** inflation of thresholds that are statutorily unindexed (NIIT, unindexed state brackets, SS taxation thresholds).
> - Any obvious misses in the code.
> - **First-spouse death handling:** do TDAs get rolled over? Does the tax bracket change appropriately? Is the SS survivor benefit properly calculated?
> - Validate that **all tracked accounts** are properly accounted for.
>
> **D.** Document any missing taxation-related issues, in priority order, in `.planning/MissingFeatures.md`.
>
> **E.** Identify architectural issues and document them in `.planning/ARCHITECTUREIssues.md`, including missing test cases, useless or orphaned test cases, and organizational issues (duplication of code rather than reuse). Also note any hard-coded conditions or constants that would need to change if federal or supported-state tax law changes.
>
> **F.** Identify usability issues in a large browser window *and* on a smaller-real-estate device (tablet, smartphone). Summarize in `.planning/UsabilityFlaws.md`.
>
> **Finally:** provide a two-paragraph standalone summary of the top five most important issues, flaws, or problems from among all findings.

---

## Deliverables

| File | Contains | Section |
|---|---|---|
| `.planning/FlawsToFix.md` | Security, PII, and numerical-accuracy defects, each with suspected cause | A, B, C |
| `.planning/MissingFeatures.md` | Taxation gaps, priority-ordered | D |
| `.planning/ARCHITECTUREIssues.md` | Structure, test-suite health, hard-coded law-dependent constants | E |
| `.planning/UsabilityFlaws.md` | Desktop and small-screen findings | F |
| (in-session) | Two-paragraph standalone top-five summary | all |

Every finding states: **what**, **where** (file/line where possible), **suspected cause**, **severity**, and **whether it is creator-side or user-side exposure**.

---

## Execution order (recommended phasing)

| Phase | Sections | Why grouped |
|---|---|---|
| 1 | **A + B** | Highest stakes, bounded, mostly static inspection. Do first. |
| 2 | **C** | Largest by far. Needs hand-verified cases computed independently of the code, then compared to engine output. Budget a full session. |
| 3 | **D + E** | D falls out of C's findings; E is structural review of the same ground. |
| 4 | **F** | Independent of the rest; can run any time. |

The two-paragraph summary is written **after the final phase**, drawing on all four documents.

---

## Standing methodology requirements

1. **Verify, don't recall.** Every claim about the code is checked against the source in this session. Statutory constants are checked against primary sources (IRS Revenue Procedures, CMS, SSA, HHS) — never from memory.
2. **Section C means arithmetic, not inspection.** "Within a dollar" requires computing the expected figure by hand from primary-source law, then comparing to engine output. Reading the code and judging it plausible does not satisfy C.
3. **Border cases are the point.** For each threshold (IRMAA tier, NIIT, LTCG bracket, SS provisional income, ACA cliff, RMD age), test **one dollar below and one dollar above**.
4. **Findings are pinned to a build.** Record version and source hash at the top of each document.
5. **Distinguish defect from documented limitation.** A simplification that is disclosed in-app and in METHODOLOGY is not a defect; an *undisclosed* one is. Say which.
6. **Report scope honestly.** If a section can't be completed in the session, say so explicitly and list what remains rather than producing a thin pass.

---

## Standing requirement — visible version number

*(Originating suggestion: "add a monotonically increasing version number that is visible. Without it, you won't know if what people report is in the code you just fixed, already fixed last week, or haven't fixed.")*

Every audited build must carry a **monotonically increasing, user-visible version**, so any report can be pinned to a build. The audit checks that:

- the version is visible in the running app (not only in source);
- it appears in every artifact a user might quote from (app chrome, embedded docs, repo changelog);
- **it is written into any exported data file**, so a user's export identifies the build that produced it;
- a source hash is recorded per release, tying the published artifact to tested source;
- there is an affordance that makes a bug report self-identifying (e.g. a footer line the user can copy: version + hash).

Any of these missing is itself a finding for `.planning/ARCHITECTUREIssues.md`.
