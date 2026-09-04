// package_check.mjs — validate a release zip against OPERATIONS §L before it is sent.
//
// WHY THIS EXISTS. §L has been written and detailed since v5.36 and was skipped anyway at the v5.42
// ship: nothing cross-referenced it, and the project instructions — injected into every conversation
// — described a DIFFERENT deliverable layout, so the always-present instruction won and §L was never
// read. Both documents are now fixed, but a prose rule that nothing checks is a rule this project has
// watched drift five separate times (§B2, E-14, E-18). This is the executable half.
//
// It answers the question §L actually cares about — "is this zip shaped right, and does it contain
// exactly the right files?" — rather than "did someone remember to read §L."
//
//   usage: node qa/tools/package_check.mjs <zip-or-unpacked-dir> [clone-dir] [workspace-dir] [pool-dir]
//   The pool argument is POST-SHIP: run it again after uploading to close section J.
//
// The clone is the committed tree to diff `github/` against. Omit it and the content checks that
// need it are SKIPPED AND SAID SO — never silently passed. Clone it yourself with:
//   git clone --depth 1 https://github.com/stextor/danger-close.git /tmp/ship
//
// The THIRD argument is optional and is the run folder the release was built and verified in. With
// it, section G answers the question the rest of this file structurally cannot: not "is everything
// in the package correct?" but "is everything that CHANGED actually in the package?" Without it,
// section G is skipped and says so. E-1b covers the common case with no extra input.
//
// TOOLING. Asserts about the PACKAGE, not the app. Counted in NO release check total (OPERATIONS
// §B1) — it verifies the delivery, not the build.
import { existsSync, readFileSync, readdirSync, statSync, mkdtempSync } from "fs";
import { join, relative, sep, basename } from "path";
import { tmpdir } from "os";
import { execFileSync } from "child_process";
import { createHash } from "crypto";

let pass = 0, fail = 0, skip = 0;
const fails = [];
const ck = (name, ok, detail = "") => {
  if (ok) { pass++; console.log(`  \u2713 ${name}`); }
  else { fail++; const m = `  \u2717 ${name}${detail ? " \u2014 " + detail : ""}`; console.log(m); fails.push(m); }
};
const skipped = (name, why) => { skip++; console.log(`  \u2013 SKIPPED: ${name} \u2014 ${why}`); };

const md5 = p => createHash("md5").update(readFileSync(p)).digest("hex");
const walk = (dir, base = dir) => {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p, base));
    else out.push(relative(base, p).split(sep).join("/"));
  }
  return out;
};

// ── resolve the package ──────────────────────────────────────────────────────────────────
const ARG = process.argv[2];
const CLONE = process.argv[3] || null;
const WORK = process.argv[4] || null;
const POOL = process.argv[5] || null;
if (!ARG) {
  console.log("usage: node package_check.mjs <zip-or-unpacked-dir> [clone-dir]");
  process.exit(2);
}
let ROOT;
if (statSync(ARG).isDirectory()) {
  ROOT = ARG;
} else {
  const tmp = mkdtempSync(join(tmpdir(), "pkgchk-"));
  execFileSync("unzip", ["-q", ARG, "-d", tmp]);
  const tops = readdirSync(tmp);
  ROOT = tops.length === 1 ? join(tmp, tops[0]) : tmp;
}

// ── package KIND ─────────────────────────────────────────────────────────────────────────
// Not every package is a version release: an ops/tooling package legitimately has no app source,
// no version bump, no suite run and no built artifact. Those checks are GATED on kind rather than
// waived — the same rule as §B2's per-leg gating, one level up: assert what is true for THIS
// package, never relax a check until it passes.
// FAIL-CLOSED: an undeclared package is treated as an app release and must meet the full bar.
// Declare in MANIFEST.txt with a line reading:  KIND: app-release   or   KIND: ops
const _man0 = existsSync(join(ROOT, "MANIFEST.txt")) ? readFileSync(join(ROOT, "MANIFEST.txt"), "utf8") : "";
// `handover` (added v5.57.1): a STOP package. It carries a workbench of unverified work and a
// stop-report, has no shippable half, and must NOT be measured against §L's release bar. Before
// this existed a handover had to declare `ops` and have G-1 softened by hand — a gate talked round
// instead of gated, which is the thing §B2 exists to forbid.
const KIND = (/^KIND:\s*(app-release|ops|handover)\s*$/mi.exec(_man0) || [, "app-release"])[1].toLowerCase();

console.log(`package_check \u2014 OPERATIONS \u00a7L`);
console.log(`     kind:    ${KIND}${/^KIND:/mi.test(_man0) ? "" : "  (UNDECLARED \u2014 defaulting to app-release, fail-closed)"}`);
console.log(`     package: ${ARG}`);
console.log(`     clone:   ${CLONE || "(none given \u2014 tree-diff checks will be SKIPPED)"}`);
console.log(`     work:    ${WORK || "(none given \u2014 section G will be SKIPPED)"}\n`);

// ── A · the outer shape ──────────────────────────────────────────────────────────────────
console.log("A. Structure");
if (KIND === "app-release") {
  ck("A-1: versioned outer folder named danger-close-<version>",
    /^danger-close-v\d+\.\d+/.test(basename(ROOT)), basename(ROOT));
} else {
  ck("A-1 (ops): outer folder is named danger-close-<slug>, and carries NO version",
    /^danger-close-/.test(basename(ROOT)) && !/^danger-close-v\d+\.\d+/.test(basename(ROOT)), basename(ROOT));
}
for (const f of ["README-FIRST.md", "MANIFEST.txt", "COMMIT_MESSAGE.txt"])
  ck(`A-2: ${f} present`, existsSync(join(ROOT, f)));
ck("A-3: github/ present", existsSync(join(ROOT, "github")));
ck("A-4: knowledge/ present", existsSync(join(ROOT, "knowledge")));
// §L: loose files sit at the top of github/, there is no root/ wrapper.
ck("A-5: no root/ wrapper inside github/ (loose files go to repo root)",
  !existsSync(join(ROOT, "github", "root")));

const GH = join(ROOT, "github"), KN = join(ROOT, "knowledge");
const ghFiles = existsSync(GH) ? walk(GH) : [];
const knFiles = existsSync(KN) ? walk(KN) : [];

// ── B · knowledge/ is flat, and holds the right kind of thing ────────────────────────────
console.log("\nB. knowledge/ \u2014 the pool has no folders");
ck("B-1: knowledge/ is flat (no subdirectories)",
  knFiles.every(f => !f.includes("/")), knFiles.filter(f => f.includes("/")).join(", "));
// The BUILT index.html is output, not input (§G). Shipping it to the pool is a real error:
// it would sit beside src/index.html under a name that cannot distinguish them.
const knIndex = knFiles.filter(f => f === "index.html");
ck("B-2: no built index.html in knowledge/ (it is output, not input \u2014 \u00a7G)",
  knIndex.length === 0);
const knSrc = knFiles.filter(f => /^DangerClose-v5_\d+\.jsx$/.test(f));
if (KIND === "app-release") {
  ck("B-3: exactly one versioned app source in knowledge/ (the incoming half of the two-source rotation)",
    knSrc.length === 1, knSrc.join(", ") || "none");
} else {
  ck("B-3 (ops): NO app source ships \u2014 an ops package that carries one would rotate the pool by accident",
    knSrc.length === 0, knSrc.join(", "));
}

// ── C · MANIFEST is the authority, so it must be true ────────────────────────────────────
console.log("\nC. MANIFEST.txt \u2014 \u00a7L: 'the manifest is the authority'");
const manPath = join(ROOT, "MANIFEST.txt");
if (!existsSync(manPath)) {
  ck("C-1: MANIFEST.txt readable", false, "absent");
} else {
  const man = readFileSync(manPath, "utf8");
  // rows look like: <md5>  <path-relative-to-its-section>
  const rows = [...man.matchAll(/^([0-9a-f]{32})\s\s+(\S.*)$/gm)].map(m => ({ md5: m[1], name: m[2].trim() }));
  ck("C-1: MANIFEST lists files with md5s", rows.length > 0, `${rows.length} rows`);

  // Every row must resolve to a real file in the package, with a matching hash. A manifest that
  // names a file the zip does not hold is the failure that sent the maintainer looking for
  // files that were never delivered.
  const bad = [], missing = [];
  for (const r of rows) {
    const cands = [join(GH, r.name), join(KN, r.name), join(ROOT, r.name)];
    const hit = cands.find(existsSync);
    if (!hit) { missing.push(r.name); continue; }
    if (md5(hit) !== r.md5) bad.push(`${r.name} (listed ${r.md5.slice(0, 8)}, actual ${md5(hit).slice(0, 8)})`);
  }
  ck("C-2: every MANIFEST row resolves to a file in the package", missing.length === 0, missing.join(", "));
  ck("C-3: every MANIFEST md5 matches the file it names", bad.length === 0, bad.join(" | "));

  // …and the reverse: a file present but unlisted is invisible to anyone working from the
  // manifest, which is the same shape as an unlisted pool file (E-14).
  const listed = new Set(rows.map(r => r.name));
  const unlisted = [...ghFiles, ...knFiles].filter(f => !listed.has(f));
  ck("C-4: no file in the package is missing from MANIFEST", unlisted.length === 0, unlisted.join(", "));

  // §L requires the suite to be run FROM THE PACKAGED COPIES before the zip is cut. That cannot
  // be verified from the outside, so require it to be RECORDED — an unrecorded run is one nobody
  // can check, and "I ran it" is exactly the kind of claim this project does not accept.
  if (KIND === "app-release") {
    ck("C-5: MANIFEST records a suite run from the PACKAGED copies (\u00a7L)",
      /packaged copies/i.test(man) && /\d+\s+app checks|\d+\s+passed/i.test(man));
    ck("C-6: MANIFEST records smoke_built against the packaged index.html (\u00a7L)",
      /smoke[_ ]built/i.test(man));
  } else {
    // An ops package still has to say how IT was verified — the standard does not lapse just
    // because no app suite applies.
    ck("C-5 (ops): MANIFEST records how this package was verified",
      /verified|negative-control|controls|checks/i.test(man));
    ck("C-6 (ops): no built index.html ships from an ops package",
      !ghFiles.includes("index.html"), "index.html present in github/");
  }
}

// ── D · changed-files-only, against the committed tree ───────────────────────────────────
console.log("\nD. github/ \u2014 \u00a7L: 'changed files only'");
if (!CLONE || !existsSync(CLONE)) {
  skipped("D-1/D-2: github/ contents vs the committed tree",
    "no clone given. git clone --depth 1 https://github.com/stextor/danger-close.git /tmp/ship");
} else {
  const unchanged = [], changed = [];
  for (const f of ghFiles) {
    const r = join(CLONE, f);
    if (existsSync(r) && md5(r) === md5(join(GH, f))) unchanged.push(f); else changed.push(f);
  }
  // Shipping an unchanged file is not harmless: it pads the diff the maintainer has to review
  // and invites re-uploading a file that did not need it.
  ck("D-1: every file in github/ actually differs from the committed tree",
    unchanged.length === 0, `unchanged: ${unchanged.join(", ")}`);

  // The other direction is the one that bit at v5.42. A misplaced path is the live risk here:
  // knowledge is flat while the repo is nested, so a file can easily land at github/qa/x.mjs when
  // it belongs at github/qa/tools/x.mjs — and that uploads to the wrong repo folder silently.
  // Any github/ path NOT already in the repo is either genuinely new or misplaced; require
  // README-FIRST to declare it, so a typo cannot pass as a new file.
  const rfText = existsSync(join(ROOT, "README-FIRST.md")) ? readFileSync(join(ROOT, "README-FIRST.md"), "utf8") : "";
  const repoPaths = new Set(walk(CLONE).filter(f => !f.startsWith(".git/")));
  // ⚠ The declaration must be by FULL PATH. An earlier version also accepted a bare basename,
  // and that silently defeated the whole check: README-FIRST lists every knowledge/ file by bare
  // name, so ANY misplaced repo file was excused by its own filename. Caught by negative control
  // P5 (§B2) — the control did not fire, and the control was right.
  const undeclared = ghFiles.filter(f => !repoPaths.has(f) && !rfText.includes(f));
  ck("D-2: every github/ path is an existing repo path, or is declared BY FULL PATH in README-FIRST (catches a misplaced folder)",
    undeclared.length === 0, undeclared.join(", "));
  console.log(`     (informational: ${changed.length} changed/new files in github/)`);
}

// ── E · the two destinations agree with each other ───────────────────────────────────────
console.log("\nE. Cross-destination consistency");
// A file that goes to BOTH destinations must be the same bytes in both, or the pool and the repo
// diverge the moment they are uploaded — the drift the freshness check exists to catch, shipped
// pre-made.
const ghByName = new Map(ghFiles.map(f => [f.split("/").pop(), join(GH, f)]));
const mismatched = [];
for (const k of knFiles) {
  const g = ghByName.get(k);
  if (g && md5(g) !== md5(join(KN, k))) mismatched.push(k);
}
ck("E-1: files shipped to BOTH destinations are byte-identical in both",
  mismatched.length === 0, mismatched.join(", "));

// ── E-1b · THE REVERSE DIRECTION. D-1 asks "does everything in github/ differ from the tree?";
// nothing asked "does everything that differs from the tree appear in github/?" A file simply
// OMITTED from github/ is invisible to every check above, because it is not in the package at all.
//
// That is not hypothetical. At the v5.47 ship `PROJECT_KNOWLEDGE_INDEX.md` was updated in the pool
// half and left out of the repo half. package_check passed 23/23, and the repo's copy sat naming a
// `.jsx` the rotation had just deleted until the post-ship freshness sweep found it a day later.
//
// NEGATIVE CONTROL, run 2026-08-23: the v5.47 package UNMODIFIED, as it actually shipped, against a
// clone of the pre-v5.47 tree. It passed 23/23 at the time; with E-1b it reports DO NOT SEND THIS
// ZIP and names `PROJECT_KNOWLEDGE_INDEX.md`. The control is the real artifact, not a simulation.
//
// The package cannot know what the maintainer's workspace holds — but it does not have to. Most
// documents that live in both places ship to both, so a `knowledge/` file whose repo counterpart
// EXISTS and DIFFERS is a file that should have gone to `github/` too. That is exactly the shape
// of the v5.47 miss, and it needs no extra input.
if (CLONE && existsSync(CLONE)) {
  const repoAll = walk(CLONE).filter(f => !f.startsWith(".git/"));
  const byBase = new Map();
  for (const r of repoAll) {
    const b = r.split("/").pop();
    if (!byBase.has(b)) byBase.set(b, []);
    byBase.get(b).push(r);
  }
  const ghSet = new Set(ghFiles);
  const orphans = [];
  for (const k of knFiles) {
    // The versioned source is renamed across the two destinations by design; E-2 covers it.
    if (/^DangerClose-v5_\d+\.jsx$/.test(k)) continue;
    const cands = byBase.get(k) || [];
    // Unambiguous counterpart only. A basename matching several repo paths cannot be resolved
    // from here, and guessing which one was meant is how a check starts lying.
    if (cands.length !== 1) continue;
    const repoPath = cands[0];
    if (md5(join(CLONE, repoPath)) === md5(join(KN, k))) continue;   // identical: nothing owed
    if (!ghSet.has(repoPath)) orphans.push(`${k} (differs from ${repoPath}, absent from github/)`);
  }
  ck("E-1b: every knowledge/ file that DIFFERS from its repo counterpart also ships to github/",
    orphans.length === 0, orphans.join(" | "));
} else {
  skipped("E-1b: knowledge/ files that differ from the repo but are missing from github/",
    "no clone given — this is the check that caught nothing at v5.47");
}

// The versioned source in knowledge/ must be the same bytes as src/DangerClose.jsx in github/ —
// the "shipped jsx == canonical == build input" hash rule, checked rather than asserted.
const srcGh = join(GH, "src/DangerClose.jsx");
if (knSrc.length === 1 && existsSync(srcGh)) {
  ck("E-2: knowledge/DangerClose-v5_*.jsx == github/src/DangerClose.jsx (the hash-verify rule)",
    md5(join(KN, knSrc[0])) === md5(srcGh));
} else if (KIND === "app-release") {
  ck("E-2: versioned source vs canonical source both present", false, "one of the two is absent");
}  // ops packages ship neither, by design (B-3 (ops) already asserts that) — nothing to compare

// ── F · README-FIRST carries the delete-first list ───────────────────────────────────────
console.log("\nF. README-FIRST.md");
const rfPath = join(ROOT, "README-FIRST.md");
if (existsSync(rfPath)) {
  const rf = readFileSync(rfPath, "utf8");
  // The pool is add-only: a same-name upload creates a SECOND copy. A package without an explicit
  // delete list will silently double files in the pool.
  ck("F-1: names the delete-first list for the pool (\u00a7G \u2014 the pool is add-only)",
    /delete[- ]first|DELETE FIRST/i.test(rf));
  ck("F-2: every knowledge/ file that replaces a pool file is named for deletion",
    knFiles.filter(f => !/^DangerClose-v5_\d+\.jsx$/.test(f))
           .every(f => rf.includes(f)),
    knFiles.filter(f => !/^DangerClose-v5_\d+\.jsx$/.test(f) && !rf.includes(f)).join(", "));
  ck("F-3: states the two destinations explicitly", /github/i.test(rf) && /knowledge/i.test(rf));
} else ck("F-1: README-FIRST.md readable", false, "absent");

// ── G · did anything that CHANGED get left out? ──────────────────────────────────────────
// The one question the zip and the clone cannot answer between them. E-1b catches the common
// shape (a doc that lives in both destinations); this catches the rest, including a repo-only
// file — REVIEWING.md, VERIFICATION_REPORT.md, the built index.html — edited and then forgotten.
// Needs the run folder the release was verified in, because that is the only place the full set
// of changes exists.
//
// NEGATIVE CONTROL, run 2026-08-23: a workspace with REVIEWING.md edited and absent from the
// package. E-1b passes (REVIEWING.md is repo-only, so no knowledge/ copy exists to compare) and
// G-1 fires. The two checks are complementary, not nested — which is why both are here.
//
// ⚠ FIRST REAL USE, 2026-08-23: G-1 fired on the very package that introduced it, naming
// `package.json`. It was RIGHT. `npm i <pkg>` in a run folder rewrites package.json with resolved
// dependency versions, so a working run folder drifts from the committed scaffold as a side effect
// of setting itself up — which is exactly why OPERATIONS §N3a installs jsdom with `--no-save`. The
// fix is to quarantine the drift and revert to the shipped copy, not to exempt the file here: a
// polluted package.json that ships would change the build scaffold for everyone. If G-1 names a
// file you did not mean to change, that is the check working.
console.log("\nG. Completeness \u2014 everything that differs from the tree is IN the package");
if (!WORK || !existsSync(WORK)) {
  skipped("G-1: workspace vs the committed tree",
    "no workspace given. Pass the run folder as the third argument to close this.");
} else if (!CLONE || !existsSync(CLONE)) {
  skipped("G-1: workspace vs the committed tree", "needs a clone as well as a workspace");
} else {
  // Map workspace paths onto repo paths the way the run folder flattens them: sources at the root,
  // every harness and suite file together in qa/.
  const repoAll = new Set(walk(CLONE).filter(f => !f.startsWith(".git/")));
  const candidates = (w) => {
    if (w === "DangerClose.jsx") return ["src/DangerClose.jsx"];
    if (w.startsWith("qa/")) return [w, `qa/qa-baseline/${w.slice(3)}`];
    return [w];
  };
  const ghSet = new Set(ghFiles);
  const missing = [];
  for (const w of walk(WORK)) {
    if (w.startsWith("node_modules/") || w.includes("/node_modules/")) continue;
    for (const r of candidates(w)) {
      if (!repoAll.has(r)) continue;
      if (md5(join(WORK, w)) === md5(join(CLONE, r))) break;   // unchanged: nothing owed
      if (!ghSet.has(r)) missing.push(`${w} -> ${r}`);
      break;
    }
  }
  ck("G-1: every workspace file that differs from the committed tree is in github/",
    missing.length === 0, missing.join(" | "));

  // ── G-2 (added v5.57.1) · the case G-1 STRUCTURALLY CANNOT SEE ────────────────────────────
  // G-1's loop reads `if (!repoAll.has(r)) continue;` — it only considers workspace files that
  // ALREADY EXIST in the repo. A brand-new file has no counterpart, so it is skipped. G-1 can
  // catch a file you CHANGED and forgot to ship; it can never catch one you CREATED.
  //
  // THE INSTANCE THAT EARNED THIS. v5.57 shipped `github/qa/tools/` EMPTY. Three instruments the
  // release's own CHANGELOG cites — `vergates.cjs`, `notes_probe.cjs`, `lits.cjs` — were left in
  // the workspace. G-1 passed twice: once because it was handed the VERIFICATION folder, which is
  // derived from the package and can only agree with it, and once correctly invoked, because of
  // the `continue` above. Found by the maintainer noticing an empty directory.
  //
  // ⚠ SCOPED DELIBERATELY, because a check that cries wolf gets ignored — the VERIFY.sh failure
  //   by another road. A run folder is FULL of legitimately new files: built artifacts, the two
  //   source legs, node_modules. G-2 asks only about hand-written suite and tool files under
  //   `qa/`, which is where a forgotten instrument actually lands.
  const DERIVED = /^(app_|dom_|v5\d|DangerClose\.jsx|package(-lock)?\.json|METHODOLOGY\.md)/;
  const orphans = [];
  for (const w of walk(WORK)) {
    if (w.startsWith("node_modules/") || w.includes("/node_modules/")) continue;
    if (!w.startsWith("qa/")) continue;                       // sources at the root are the legs
    const leaf = w.slice(w.lastIndexOf("/") + 1);
    if (DERIVED.test(leaf)) continue;                          // built by mk_testable / esbuild
    if (!/\.(mjs|cjs|jsx|js|sh|md)$/.test(leaf)) continue;     // fixtures and data are not owed
    if (candidates(w).some(r => repoAll.has(r))) continue;     // not new; G-1 owns it
    if (!ghSet.has(w) && !ghSet.has(`qa/qa-baseline/${leaf}`)) orphans.push(w);
  }
  ck("G-2: every NEW hand-written file under qa/ is in github/ (the case G-1 skips)",
    orphans.length === 0, orphans.join(" | "));
}

// ── H · PROVENANCE over an INDEPENDENT path (added 2026-08-28, decision D-1 route A1) ────
// Every other check in this file reads the clone. The clone is the same object the package was
// built against, so it cannot answer "does what GitHub actually holds match what the release
// CLAIMS?" — a claim that nothing makes expire (docs/SCOPE_CLAIM_EXPIRY_VERIFICATION.md §1).
//
// The gap is not hypothetical. Commit 66db033 was titled "v5.53" while `src/DangerClose.jsx` at
// that commit still hashed to v5.52's source: the built artifact went up ahead of the source, and
// for the span between that commit and b825fa5 the repo carried a release whose source was the
// PREVIOUS one. Nothing detected the window while it was open.
//
// So: fetch the two artifacts over raw.githubusercontent.com — a path that is not the clone — and
// compare BOTH to the provenance line of the newest CHANGELOG entry. Source alone is not enough;
// built alone is not enough; the 66db033 shape is precisely the two disagreeing.
//
// ⚠ This proves what the REPO holds, not what Pages SERVES. Pages can trail a commit, and a
// session cannot reach stextor.github.io (403 — not in the egress allowlist). The maintainer-side
// one-liner in OPERATIONS §I is the only thing that verifies the served bytes, and this check does
// not replace it. Saying so here is the point: a check that overstates what it proves is worse
// than no check.
console.log("\nH. Provenance \u2014 what GitHub holds vs what the CHANGELOG claims (independent path)");
{
  const RAW = "https://raw.githubusercontent.com/stextor/danger-close/main";
  const chPath = join(CLONE, "CHANGELOG.md");
  if (!existsSync(chPath)) {
    skipped("H-1: provenance cross-check", "no CHANGELOG.md in the clone");
  } else {
    const ch = readFileSync(chPath, "utf8");
    // Newest entry only. The provenance line (OPERATIONS §G, from v5.12) ends that entry and
    // carries both md5s; older entries have their own and must not be matched.
    // ⚠ Slice FROM the newest `## v` heading, not from the top of the file. The original sliced
    // from byte 0, which was correct only while the newest version entry was also the FIRST
    // entry. On 2026-08-28 five `## Unreleased — qa/ only:` entries were added above v5.53 —
    // legitimately, that is the house convention for ops work — and each correctly quoted the
    // v5.53 source hash. That widened this window to include them, and H-1 then PASSED against a
    // v5.53 provenance line whose md5 had been corrupted, because the hash was still findable
    // elsewhere in the window. Caught by testing it before shipping the entries that caused it.
    //
    // The lesson is the one this release cycle keeps re-teaching: when a check's INPUTS change,
    // the check can quietly start asserting something weaker than its name claims. Ask what it
    // would take to fail, every time it passes.
    const firstHeading = ch.indexOf("\n## v");
    const end = firstHeading >= 0 ? ch.indexOf("\n## v", firstHeading + 1) : -1;
    const head = firstHeading >= 0 ? ch.slice(firstHeading, end > 0 ? end : undefined) : ch;
    const hashes = [...head.matchAll(/\b([0-9a-f]{32})\b/g)].map(m => m[1]);
    const version = (/^## (v[0-9][^\s—-]*)/m.exec(ch) || [, "?"])[1];
    if (hashes.length < 2) {
      skipped("H-1: provenance cross-check",
        `newest CHANGELOG entry (${version}) carries ${hashes.length} md5(s); need the source+built pair`);
    } else {
      let fetched = null;
      try {
        const get = u => execFileSync("curl", ["-fsSL", "--max-time", "25", u],
          { maxBuffer: 1 << 28, encoding: "buffer" });
        fetched = {
          src: createHash("md5").update(get(`${RAW}/src/DangerClose.jsx`)).digest("hex"),
          built: createHash("md5").update(get(`${RAW}/index.html`)).digest("hex"),
        };
      } catch (e) {
        // Offline is a legitimate state; a silent pass is not. Skip loudly, per this file's idiom.
        skipped("H-1: provenance cross-check", `could not reach raw.githubusercontent.com (${e.code || "fetch failed"})`);
      }
      if (fetched) {
        const set = new Set(hashes);
        ck(`H-1: served source md5 appears in the newest CHANGELOG entry (${version})`,
          set.has(fetched.src), `fetched ${fetched.src.slice(0, 8)}, entry lists ${hashes.map(h => h.slice(0, 8)).join(" ")}`);
        ck(`H-2: served built index.html md5 appears in the newest CHANGELOG entry (${version})`,
          set.has(fetched.built), `fetched ${fetched.built.slice(0, 8)}, entry lists ${hashes.map(h => h.slice(0, 8)).join(" ")}`);
        // The 66db033 shape: both individually plausible, but taken from different releases.
        // Also compare to the clone — a mismatch here means the clone and the raw path disagree,
        // which is either a mid-push window or a cache, and is worth saying out loud either way.
        const cs = existsSync(join(CLONE, "src/DangerClose.jsx")) ? md5(join(CLONE, "src/DangerClose.jsx")) : null;
        const cb = existsSync(join(CLONE, "index.html")) ? md5(join(CLONE, "index.html")) : null;
        ck("H-3: the independent path and the clone agree on both artifacts",
          cs === fetched.src && cb === fetched.built,
          `clone src=${(cs || "?").slice(0, 8)} raw src=${fetched.src.slice(0, 8)} | clone built=${(cb || "?").slice(0, 8)} raw built=${fetched.built.slice(0, 8)}`);
      }
    }
  }
}

// ── I · SCOPE STATUS LINES (added 2026-08-28, decision D-2 route B2) ─────────────────────
// A scope's status line is written by the session that drafts it and read by every session after;
// nothing in the release path makes it expire. Swept 2026-08-26: nine live-looking, SEVEN already
// shipped, two saying DO NOT PROCEED about shipped work. Swept again 2026-08-28: twelve, one
// reading BUILD GATE OPEN about work shipped twenty-nine releases earlier.
//
// ⚠ This REPORTS; it does not decide, and that is deliberate. The obvious automation — "the scope
// names a version, that version is in the CHANGELOG, so retire it" — is UNSOUND. `## v5.34` is in
// the CHANGELOG, but v5.34 narrowed mid-build ("backed out and held for v5.35") and the work
// re-landed at v5.36; that test would have written a false history automatically, at every ship.
// Resolving a candidate means reading what the release actually shipped. A machine can find the
// candidates; only a person can close them.
//
// The OPEN list below is the allowlist, and it lives HERE rather than in a document on purpose: a
// scope that is neither retired nor listed fails this check, so adding one without classifying it
// is loud. Keep it short, and delete from it when a scope is retired.
console.log("\nI. Scope status lines \u2014 candidates for retirement (reports, does not decide)");
{
  const docs = join(CLONE, "docs");
  if (!existsSync(docs)) {
    skipped("I-1: scope status-line sweep", "no docs/ in the clone");
  } else {
    // ⚠ AN ENTRY HERE NEEDS THE SAME CONTENT CHECK A RETIREMENT DOES. Read the scope's premises
    //   against the CURRENT source and decide whether they still hold. A status line is evidence
    //   of what was true when it was written, nothing more.
    //   THE INSTANCE THAT EARNED THIS. Two entries were added at v5.54 on the strength of a
    //   session brief's classification, with no content check, in the release whose entire lesson
    //   was that status lines go stale. Both named scopes whose work had ALREADY SHIPPED —
    //   `SCOPE_v5_40_disclosures_and_mechanics` at v5.40 and `SCOPE_FIX_tidyup_six` across
    //   v5.42–v5.47. I-2 would have caught both. This list excused them, for four releases.
    //   Removed at v5.57.1 after re-verifying every premise by content against v5.57.
    const OPEN = new Set([
      "SCOPE_STANDING_AUDIT.md",                  // not a build scope at all (OPERATIONS §K)
      "SCOPE_HOUSEKEEPING_THREE.md",              // awaiting decisions in its §5
      // Added v5.61, REWRITTEN 2026-09-04. The reason changed and the entry did not expire.
      // D-2 and D-3 were APPROVED on 2026-09-04 — (b) and (b) — so this scope is no longer
      // awaiting decisions; it is approved and NOT YET BUILT, which is still legitimately OPEN
      // and still none of RETIRED/SUPERSEDED/FULFILLED. ⚠ The entry now EXPIRES WHEN THE FIELD
      // SHIPS, and nothing here can detect that: I-3 fires only on an entry naming a file that
      // is GONE, and this file will still be there. A person removes it, in the release that
      // builds the field — the same mechanism, and the same warning shape, as the
      // SCOPE_ROTH_FICA_OTHERORD entry removed below.
      "SCOPE_INCOME_CONDITIONING.md",             // approved 2026-09-04, unbuilt (its §7)
      // Added 2026-09-04 with the scope itself. Its two decisions (H-1, H-2) are RESOLVED, but
      // H-2 and the third scope-status sweep are unbuilt, so it carries no retirement marker and
      // would fail I-2 on any package cut after it lands. Expires when H-2 has been executed and
      // the sweep run — again, only a person can retire it.
      "SCOPE_TREE_AND_POOL_HOUSEKEEPING.md",      // decided 2026-09-04, H-2 + sweep unbuilt (its §5)
      // ── REMOVED 2026-09-04 at the v5.63 ship: "SCOPE_ROTH_FICA_OTHERORD.md". Its entry was
      // added 2026-09-03 with the note that it EXPIRES THE MOMENT v5.63 SHIPS and that I-3
      // could not catch it going stale, since I-3 only fires on an entry naming a file that is
      // gone and that file would still be there. v5.63 shipped; the scope is marked FULFILLED
      // and is now caught by the RETIRED regex like any other closed scope. The expiry was
      // honoured by a person reading the note, which is the only mechanism there is for this
      // class of entry — leave the warning shape on any future one.
    ]);
    const RETIRED = /\bRETIRED\b|\bSUPERSEDED\b|\bFULFILLED\b/;
    // ⚠ The INVENTORY is post-ship too, not just the reading of each file. A scope the package
    // ADDS does not exist in the clone, so a clone-only listing makes I-3 report it as an
    // allowlist entry naming a nonexistent scope — which is what happened the first time this
    // release was packaged, on its own new scope. I-2 was fixed to read the post-ship tree and
    // I-3 was left reading the pre-ship one; the two must agree on what "the tree" means.
    const fromClone = readdirSync(docs).filter(f => /^SCOPE_.*\.md$/.test(f));
    const ghDocs = join(GH, "docs");
    const fromPkg = existsSync(ghDocs)
      ? readdirSync(ghDocs).filter(f => /^SCOPE_.*\.md$/.test(f))
      : [];
    const scopes = [...new Set([...fromClone, ...fromPkg])].sort();
    // ⚠ Read each scope from the PACKAGE when the package replaces it, and from the clone
    // otherwise — i.e. evaluate the tree AS THIS PACKAGE WILL LEAVE IT. Reading the clone alone
    // was the first draft and it was wrong in the worst direction: a release that retires a scope
    // would be marked red BY the retirement it is shipping, so every well-behaved package would
    // trip this check and it would be trained into noise within two releases. The question worth
    // asking is not "is the tree clean now" but "will the tree be clean once this lands."
    const shipped = f => {
      const p = join(GH, "docs", f);
      return existsSync(p) ? p : join(docs, f);
    };
    // A sweep that finds no scopes is a green reading from an empty set (OPERATIONS §B2). Say so.
    ck("I-1: the scope sweep actually found scopes to sweep", scopes.length > 0, `${scopes.length} found`);
    const unclassified = [];
    for (const f of scopes) {
      if (OPEN.has(f)) continue;
      // Read the head only: a retirement marker belongs at the top, where a reader meets it.
      const head = readFileSync(shipped(f), "utf8").split("\n").slice(0, 12).join("\n");
      if (!RETIRED.test(head)) unclassified.push(f);
    }
    ck("I-2: every scope is retired/superseded/fulfilled or on the OPEN allowlist, AS THIS PACKAGE LEAVES THE TREE",
      unclassified.length === 0,
      unclassified.length ? `unclassified: ${unclassified.join(", ")} \u2014 read what the release SHIPPED, not the version number` : "");
    // The allowlist is itself a claim that expires. A stale entry is the same defect one level up.
    const ghosts = [...OPEN].filter(f => !scopes.includes(f));
    ck("I-3: no OPEN-allowlist entry names a scope that no longer exists",
      ghosts.length === 0, ghosts.join(", "));
    console.log(`     (informational: ${scopes.length} scopes, ${OPEN.size} held open by name)`);
  }
}

// ── verdict ──────────────────────────────────────────────────────────────────────────────
// ── J · the POOL, after the upload ───────────────────────────────────────────────────────
// Optional 4th argument: a directory holding the project-knowledge pool. Everything above runs
// BEFORE the upload and cannot see what actually landed. Four separate post-ship corrections in
// August 2026 were all caught by hand-diffing rather than by a gate; this is that diff, gated.
if (POOL && existsSync(POOL)) {
  console.log("\nJ. Pool \u2014 what actually landed in project knowledge");
  const kn = join(ROOT, "knowledge");
  if (!existsSync(kn)) {
    skipped("J-1: knowledge/ vs the pool", "this package has no knowledge/ half");
  } else {
    const absent = [], stale = [];
    for (const f of walk(kn)) {
      const there = join(POOL, f);
      if (!existsSync(there)) absent.push(f);
      else if (md5(join(kn, f)) !== md5(there)) stale.push(f);
    }
    ck("J-1: every knowledge/ file reached the pool", absent.length === 0, absent.join(" | "));
    ck("J-2: and none of them landed STALE \u2014 the pool is add-only, so a same-name upload " +
       "without the delete first leaves the OLD copy in place",
      stale.length === 0, stale.join(" | "));
    // A rotation is TWO deletes. A pool holding three source legs means one was missed.
    const legs = readdirSync(POOL).filter(f => /^DangerClose-v5_\d+\.jsx$/.test(f)).sort();
    const doms = readdirSync(POOL).filter(f => /^dom_entry_v5\d+\.jsx$/.test(f)).sort();
    ck("J-3: the pool holds exactly two source legs (a rotation is TWO deletes)",
      legs.length === 2, legs.join(", ") || "none");
    ck("J-4: and exactly two dom entries", doms.length === 2, doms.join(", ") || "none");
  }
}


// ── K · the MANIFEST vs external truth (added 2026-09-03, ops item D-4) ──────────────────
//
// WHY THIS EXISTS, and why it is NOT the check D-4 asked for. D-4 was carried for ELEVEN releases
// as "nothing compares the manifest's two build tables," and PROJECT_KNOWLEDGE_INDEX.md's own
// Prior-build table proposed the remedy: "a one-line package_check assertion would close it."
//
// At the v5.61 ship the manifest was omitted from the release package, so NEITHER table rolled.
// Run against that defect, the proposed assertion PASSES: Current v5.60 / Prior v5.59 is a
// perfectly self-consistent pair. So does "the Current table's md5 matches the pool file it
// names" — the manifest was internally coherent while describing the wrong build entirely.
//
// Internal consistency is the one property a not-updated-at-all manifest preserves. So every
// check below that can catch that class anchors the manifest to EXTERNAL truth: the clone's
// CHANGELOG, the clone's source and artifact, and the pool's actual contents. Had D-4 been built
// as described, it would have shipped green through the defect that motivated it and been
// trusted. That is §B2 one level up — a check carried on an untested description of what it
// would catch.
console.log("\nK. Manifest — PROJECT_KNOWLEDGE_INDEX.md vs the clone and the pool");
{
  // ⚠ Read the manifest the package WILL LEAVE, not the one already there. A package whose whole
  // job is to correct this document would otherwise be failed BY the correction it is shipping, and
  // every well-behaved manifest fix would trip K and train it into noise within two releases. This
  // is the identical mistake I-2's own comment records making and fixing on its first draft; it was
  // made again here, on the first package section K was run against, and caught the same way.
  // Order: the package's github/ copy, then knowledge/, then the pool, then the clone.
  const mCands = [join(GH, "PROJECT_KNOWLEDGE_INDEX.md"), join(KN, "PROJECT_KNOWLEDGE_INDEX.md"),
                  POOL && join(POOL, "PROJECT_KNOWLEDGE_INDEX.md"),
                  CLONE && join(CLONE, "PROJECT_KNOWLEDGE_INDEX.md")];
  const mPath = mCands.find(p => p && existsSync(p));
  if (!mPath) {
    skipped("K-1..K-9: manifest checks", "no manifest in the package, the pool or the clone");
  } else {
    const src = mPath.startsWith(GH) ? "the package's github/" : mPath.startsWith(KN) ? "the package's knowledge/"
              : (POOL && mPath.startsWith(POOL)) ? "the pool" : "the clone";
    console.log(`     (reading the manifest from ${src})`);
    const M = readFileSync(mPath, "utf8");
    // Build tables are pipe rows under a heading. Read the FIRST table after each heading only:
    // both sections carry historical rolled-notes below them and those must not be parsed.
    const table = heading => {
      const i = M.indexOf(heading);
      if (i < 0) return null;
      const out = {};
      for (const line of M.slice(i, i + 800).split("\n")) {
        const m = line.match(/^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/);
        if (!m) continue;
        const k = m[1].replace(/`/g, "").trim(), v = m[2].replace(/[`*]/g, "").trim();
        if (k && k !== "Field" && !/^-+$/.test(k)) out[k] = v;
      }
      return Object.keys(out).length ? out : null;
    };
    const C = table("## Current build"), P = table("## Prior build");
    if (!C || !P) {
      ck("K-0: both build tables parse", false, "Current or Prior table not found \u2014 headings moved?");
    } else {
      ck("K-0: both build tables parse", true);

      // K-1..K-3 anchor the CURRENT table to the committed tree. These are the three that catch
      // a manifest which simply was not updated.
      if (CLONE && existsSync(CLONE)) {
        const clV = (readFileSync(join(CLONE, "CHANGELOG.md"), "utf8").match(/^## (v[\d._]+)/m) || [])[1];
        ck("K-1: manifest's Current version == the newest CHANGELOG entry",
          C.Version === clV, `manifest ${C.Version}, CHANGELOG ${clV}`);
        const srcP = join(CLONE, "src/DangerClose.jsx"), artP = join(CLONE, "index.html");
        ck("K-2: manifest's Current source md5 == the committed src/DangerClose.jsx",
          existsSync(srcP) && C["Source md5"] === md5(srcP),
          `manifest ${C["Source md5"]}, tree ${existsSync(srcP) ? md5(srcP) : "absent"}`);
        ck("K-3: manifest's Current built md5 == the committed index.html",
          existsSync(artP) && C["Built index.html md5"] === md5(artP),
          `manifest ${C["Built index.html md5"]}, tree ${existsSync(artP) ? md5(artP) : "absent"}`);
      } else {
        skipped("K-1..K-3: Current table vs the committed tree", "no clone given");
      }

      // K-4..K-6 anchor BOTH tables to the pool. K-4 is what catches a table naming a leg the
      // rotation has already removed.
      if (POOL && existsSync(POOL)) {
        const named = [C, P].map(t => t["Source file in knowledge"]);
        const missing = named.filter(f => !f || !existsSync(join(POOL, f)));
        ck("K-4: every source file the two tables name is still in the pool",
          missing.length === 0, missing.join(", "));
        const wrong = [];
        for (const t of [C, P]) {
          const f = t["Source file in knowledge"];
          if (!f || !existsSync(join(POOL, f))) continue;
          if (md5(join(POOL, f)) !== t["Source md5"]) wrong.push(`${f} (table ${t["Source md5"]}, pool ${md5(join(POOL, f))})`);
        }
        ck("K-5: each table's source md5 == the actual md5 of the pool file it names",
          wrong.length === 0, wrong.join(" | "));
        const legs = readdirSync(POOL).filter(f => /^DangerClose-v5_\d+\.jsx$/.test(f)).sort();
        ck("K-6: the pool's two legs ARE the two the tables name",
          legs.join() === named.filter(Boolean).sort().join(),
          `pool [${legs.join(", ")}] vs manifest [${named.filter(Boolean).sort().join(", ")}]`);

        // K-8: the §A2 fallback hash table. Its own header records 2026-08-28, when it "VOUCHED
        // for two stale pool files, and the freshness check passed on them." At v5.61, 21 of its
        // 72 hashed rows were wrong. A fallback nobody checks is a fallback that lies.
        const rows = [...M.matchAll(/\|\s*`?([A-Za-z0-9_.-]+\.(?:mjs|cjs|jsx|js|sh|md|html|json|txt))`?\s*\|[^|]*\|?\s*`?([0-9a-f]{32})`?/g)];
        const seen = new Set(), badHash = [], ghostRow = [];
        for (const [, f, h] of rows) {
          if (seen.has(f + h)) continue; seen.add(f + h);
          const there = join(POOL, f);
          if (!existsSync(there)) { ghostRow.push(f); continue; }
          if (md5(there) !== h) badHash.push(f);
        }
        ck("K-8: every hashed manifest row matches its pool file, and names a file that exists",
          badHash.length === 0 && ghostRow.length === 0,
          [badHash.length ? `stale: ${badHash.join(", ")}` : "",
           ghostRow.length ? `not in pool: ${ghostRow.join(", ")}` : ""].filter(Boolean).join(" | "));

        // K-9: §G requires every pool file listed explicitly — "never elide a range with '…',
        // because a file inside the ellipsis becomes invisible." 14 pool files were unnamed at
        // v5.61, eleven of them predating it.
        const unlisted = readdirSync(POOL).filter(f => !M.includes(f));
        ck("K-9: every pool file is named somewhere in the manifest (\u00a7G: list every file explicitly)",
          unlisted.length === 0, unlisted.join(", "));
      } else {
        skipped("K-4..K-6, K-8, K-9: manifest vs the pool", "no pool given \u2014 this is the POST-SHIP half");
      }

      // K-7 is D-4 EXACTLY AS ORIGINALLY FRAMED, and it is kept deliberately underneath a warning.
      // \u26a0 IT DOES NOT FIRE on a manifest that was never updated: if neither table rolls they stay
      // mutually consistent, which is precisely the v5.61 defect. It DOES catch the other real
      // case \u2014 one table rolled and the other not \u2014 which ran for SEVEN releases before v5.59
      // caught it by eye. Ship it, but never as the manifest's only guard: K-1..K-6 are the ones
      // that catch a stale-in-both-tables manifest. The danger was never this assertion; it was
      // believing it sufficient.
      const num = v => Number(String(v).replace(/[^\d]/g, ""));
      ck("K-7: Prior is exactly one release below Current (WEAK \u2014 cannot see a both-tables-stale manifest; see K-1..K-6)",
        num(C.Version) === num(P.Version) + 1, `Current ${C.Version}, Prior ${P.Version}`);
    }
  }
}

console.log(`\npackage_check: ${pass} passed, ${fail} failed, ${skip} skipped`);
if (skip) console.log("  \u26a0 A SKIPPED check is not a passed one. Re-run with a clone to close the gap.");
if (fail) { console.log("\nDO NOT SEND THIS ZIP:"); fails.forEach(f => console.log(f)); }
process.exit(fail ? 1 : 0);
