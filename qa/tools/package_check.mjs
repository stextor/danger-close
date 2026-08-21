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
//   usage: node qa/tools/package_check.mjs <zip-or-unpacked-dir> [clone-dir]
//
// The clone is the committed tree to diff `github/` against. Omit it and the content checks that
// need it are SKIPPED AND SAID SO — never silently passed. Clone it yourself with:
//   git clone --depth 1 https://github.com/stextor/danger-close.git /tmp/ship
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
const KIND = (/^KIND:\s*(app-release|ops)\s*$/mi.exec(_man0) || [, "app-release"])[1].toLowerCase();

console.log(`package_check \u2014 OPERATIONS \u00a7L`);
console.log(`     kind:    ${KIND}${/^KIND:/mi.test(_man0) ? "" : "  (UNDECLARED \u2014 defaulting to app-release, fail-closed)"}`);
console.log(`     package: ${ARG}`);
console.log(`     clone:   ${CLONE || "(none given \u2014 tree-diff checks will be SKIPPED)"}\n`);

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

// ── verdict ──────────────────────────────────────────────────────────────────────────────
console.log(`\npackage_check: ${pass} passed, ${fail} failed, ${skip} skipped`);
if (skip) console.log("  \u26a0 A SKIPPED check is not a passed one. Re-run with a clone to close the gap.");
if (fail) { console.log("\nDO NOT SEND THIS ZIP:"); fails.forEach(f => console.log(f)); }
process.exit(fail ? 1 : 0);
