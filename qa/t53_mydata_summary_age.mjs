// t53 — MY DATA'S SUMMARY NAMES THE AGE THE ENGINE APPLIES, AND THE EXACT FIGURE (D-25) · docs/SCOPE_D25_MYDATA_SUMMARY_AGE.md · v5.88
//
// WHAT v5.88 CHANGED. My Data's state line opens with a summary built in `MyDataEditor` from `STATE_RULES`, not from the note.
// Through v5.87 it rendered `$NK/person 65+ exclusion` for every row with a dollar exclusion: "65+" whatever age the engine applies
// (wrong for DE 60, KY any age, RI and WI 67, measured at scope), and `toFixed(0)` thousands, four of which rounded UP (DE $12,500 →
// "$13K", ME, MD, MT). v5.88 renders `$12,500/person exclusion from 60` / `… at any age` — the exact figure the engine uses and the
// age by the engine's own rule (`exclAge ?? 65`; 0 → any age). Decisions D25-A (a) and D25-B (a), Steve 2026-10-01. No engine change.
//
// HOW IT IS HELD. Each row's summary is read through the DOM and compared with the engine's MEASURED onset — the youngest age at which a
// single filer's state tax on $15,000 of retirement income drops below the no-exclusion figure (below New Mexico's income limit, which
// hid its onset at $50,000 at scope). Measured, not restated: if the display and the engine ever follow different rules, S fails.
//
// Run: node t53_mydata_summary_age.mjs <tag>   Current leg. v587 is registered ONLY so the pre-fix failure stays reproducible.
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v587", "v588", "v589", "v590", "v591", "v593", "v594", "v595"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + String(d).slice(0, 240) : ""}`); } };
const done = () => { console.log(`\nt53 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t53 \u2014 MY DATA'S SUMMARY: THE ENGINE'S AGE AND FIGURE (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const g = window.__g;
const SR = g.STATE_RULES();
const tax = (code, age) => g.stateTaxAnnual({ code, retIncome: 15000, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: age, ageB: null, single: true });
// measured onset: 0 = already applied at 39 (any age); null = never seen 40–80; else the first age the tax drops
const onset = (c) => { const t39 = tax(c, 39), t30 = tax(c, 30); if (t30 < tax(c, 80) + 1e-9 && t30 < t39 + 1e-9 && Math.abs(t30 - tax(c, 80)) < 0.005) return 0;
  for (let a = 40; a <= 80; a++) if (tax(c, a) < t39 - 0.005) return a; return null; };
const SUMMARY = /· \$([\d,]+)\/person exclusion (?:from (\d{1,2})|(at any age))(?= ·)/;

// ── the DOM harness (t51/t52's) ─────────────────────────────────────────────────────────────────────────────────────────
const body = () => window.document.body;
let root, act, DangerClose, el;
const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 30)); }); } catch (e) {} };
const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
const stateSelect = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "ME"));
const pick = async (code) => { const s = stateSelect(); if (!s) return false;
  try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(s, code); s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
  await flush(); return true; };
const modelLine = () => { const d = [...body().querySelectorAll("div")].filter(x => /^Model[ :(]/.test(x.textContent || "") && /effective rate/.test(x.textContent || ""));
  return d.length ? d.sort((a, b) => a.textContent.length - b.textContent.length)[0].textContent : ""; };
window.localStorage.clear();
el = window.document.createElement("div"); body().appendChild(el);
({ root, act, DangerClose } = window.__mount(el));
try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
await flush(); await flush();
await click([...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0]); await flush();
await click(tabBtn("my data")); await flush();
CK("D-0 setup — My Data shows a state selector", !!stateSelect());

// ── S · every exclusion row: the summary's age = the engine's measured onset = the rule; the figure = the engine's, exact ─────
const rows = Object.keys(SR).filter(c => SR[c].excl65 > 0); const seen = {}; let stale = [];
for (const c of rows) {
  await pick(c); const line = modelLine(); const m = line.match(SUMMARY);
  // the summary is the text BEFORE the note (" — "); notes may say "$20K/person" (NY, GA) and are t52's business
  if (/65\+ exclusion|K\/person/.test(line.split(" \u2014 ")[0])) stale.push(c);
  const shown = m ? (m[3] ? 0 : +m[2]) : undefined; seen[c] = { shown, line };
  const rule = SR[c].exclAge ?? 65; const on = onset(c);
  CK(`S-${c}-age summary says ${m ? (m[3] ? "at any age" : "from " + m[2]) : "(no summary)"}; engine measured ${on === 0 ? "any age" : on}, rule ${rule === 0 ? "any age" : rule}`,
     m && m[2] !== "0" && shown === on && on === rule, line.slice(0, 200));   // a zero must READ "at any age", never "from 0"
  const fig = m ? +m[1].replace(/,/g, "") : NaN;
  CK(`S-${c}-$ summary figure $${m ? m[1] : "?"} is the engine's $${SR[c].excl65.toLocaleString("en-US")}, exact`, fig === SR[c].excl65, line.slice(0, 200));
}

// ── X · extinction ──────────────────────────────────────────────────────────────────────────────────────────────────────
CK(`X-1 not vacuous: all ${rows.length} exclusion rows read (18 at v5.88)`, rows.length === 18 && Object.keys(seen).length === 18, rows.join(" "));
CK("X-2 no summary says \"65+ exclusion\" or a rounded \"$NK/person\"", stale.length === 0, stale.join(" "));
// the summary and the note cannot disagree: where a note states the modelled start ("applied here from NN / at any age", or "from (age) NN"), it matches
const noteAge = (n) => { const d = n.match(/applied here (?:from (\d{2})|at any age)/i); if (d) return d[1] ? +d[1] : 0;
  if (/no age requirement|applies at any age/i.test(n)) return 0; const f = n.match(/\bfrom (?:age )?(\d{2})\b(?!½)/); return f ? +f[1] : undefined; };
const pairs = rows.map(c => [c, noteAge(SR[c].note || ""), seen[c].shown]).filter(([, n]) => n !== undefined);
const clash = pairs.filter(([, n, s]) => n !== s).map(([c, n, s]) => `${c} note ${n} summary ${s}`);
CK(`X-3 note and summary agree on the start age (${pairs.length} rows state one in the note)`, pairs.length >= 8 && clash.length === 0, clash.join(" · ") || pairs.length);
// rows exempt outright keep their own wording, with no age and no dollar figure
for (const c of ["IL", "IA", "PA"]) { await pick(c); const l = modelLine();
  CK(`X-4-${c} exempt row: "retirement income exempt", no exclusion summary`, SR[c].retExempt && / · retirement income exempt( from \d+)?( up to \$[\d,]+ single \/ \$[\d,]+ joint)? · /.test(l) && !/\/person exclusion/.test(l), l.slice(0, 160)); }
try { await act(async () => { root.unmount(); }); } catch (e) {}
done();
