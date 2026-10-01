// t52 — A STATE NOTE NAMES ONLY THE AGE THE MODEL APPLIES, OR SAYS THE MODEL DIFFERS (D-23) · docs/SCOPE_D23_AGE_START_NOTES.md · v5.87
//
// WHAT v5.87 CHANGED. Six `STATE_RULES` notes described a start age the model does not use, or none at all. Measured on v5.86
// (scope §7a), single filer, $50,000 retirement income: New York's note said "59½+" and the model applied the exclusion from 65;
// Georgia's said "$35K at 62–64" and the model applied nothing before 65; Iowa's said "55+" and Pennsylvania's "59½+" while the
// model exempted retirement income at ANY age (`retExempt` carries no age gate — the optimistic direction); Arkansas's and
// Oklahoma's named no age. v5.87 rewrites those six notes only. No figure, rate, rule or age moves (presentation release).
//
// THE LAW EACH NOTE NOW STATES WAS READ AT THE BUILD (2026-10-01), from these primary sources:
//   NY — tax.ny.gov "Information for retired persons": 59½ or older, $20,000 per person.
//   AR — DFA Subject 206 (rev. 2/24/2023): $6,000 for employer-sponsored pensions, no age stated; traditional IRAs from 59½.
//   GA — Dept. of Audits and Accounts, Retirement Income Exclusion evaluation (Feb 2023): $35,000 at 62–64, $65,000 at 65+.
//   IA — Iowa DOR, Retirement Income Tax Guidance: 55 or older on 31 Dec, or disabled, or a qualifying survivor; per spouse.
//   PA — DOR rev-636 (IRA distributions before 59½ taxable); PA-40 instructions (employer plans: after the plan's own age or service).
//   OK — OAC 710:50-15-49 read; it does NOT settle an age condition, so Oklahoma's note claims none (D-24).
//
// Run: node t52_age_start_notes.mjs <tag>     Current leg. v586 is registered ONLY so the pre-fix failure stays reproducible:
//      on v5.86 this suite must fail (shown at the build — see the CHANGELOG entry for the count).
import { window } from "./env_dom.mjs";
import { createRequire } from "module";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
const require = createRequire(import.meta.url);
const VER = process.argv[2] || "";
const KNOWN_VERSIONS = ["v586", "v587"];
let pass = 0, fail = 0;
const CK = (n, ok, d = "") => { if (ok) { pass++; console.log(`  \u2713 ${n}`); } else { fail++; console.log(`  \u2717 ${n}${d ? " \u2014 " + String(d).slice(0, 240) : ""}`); } };
const done = () => { console.log(`\nt52 SUITE (${VER}): ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); };
console.log(`t52 \u2014 STATE NOTES AND THE AGE THE MODEL APPLIES (${VER})`);
if (!KNOWN_VERSIONS.includes(VER)) { CK(`0-0 version tag ${JSON.stringify(VER)} is registered`, false, `registered: ${KNOWN_VERSIONS}`); done(); }
console.error = () => {}; console.warn = () => {};
require(`./dom_${VER}.cjs`);
const React = require("react");
const g = window.__g;
const SR = g.STATE_RULES();
const HERE = dirname(fileURLToPath(import.meta.url));
const SETS = [join(HERE, "tools", "state_sets.cjs"), join(HERE, "state_sets.cjs")].find(existsSync);
const EQ = (n, got, exp) => CK(n, Math.abs(got - exp) <= 0.005, `engine ${Number(got).toFixed(4)}, hand ${Number(exp).toFixed(4)}`);
// single filer, $50,000 of retirement-account income, nothing else — the scope §7a probe household
const tax = (code, age) => g.stateTaxAnnual({ code, retIncome: 50000, pen: 0, work: 0, capGains: 0, ssTaxableFed: 0, ssGrossA: 0, ssGrossB: 0, ageA: age, ageB: null, single: true });
const note = c => (SR[c] && SR[c].note) || "";
const MODEL_AGE = r => r.retExempt ? 0 : (r.exclAge === undefined || r.exclAge === null ? 65 : r.exclAge);   // stateTaxAnnual's _floor; retBase has no gate
const DISCLOSE = /applied here (?:from (\d{2})|at any age)/i;

// ── T · each rewritten note states the model's age, the law's age, and the direction (typed from the sources above) ─────
const n = { NY: note("NY"), AR: note("AR"), GA: note("GA"), IA: note("IA"), PA: note("PA"), OK: note("OK") };
CK("T-NY1 New York: applied here from 65", /applied here from 65\b/.test(n.NY), n.NY);
CK("T-NY2 New York: the law's 59½, as the law's — and never \"59½+\" as if it were the model's", /law allows it from 59½/.test(n.NY) && !/59½\s*\+/.test(n.NY), n.NY);
CK("T-NY3 New York: conservative; the $20K figure and the NYC disclosure kept", /\(conservative\)/.test(n.NY) && /\$20K\/person/.test(n.NY) && /NYC local tax not modeled/.test(n.NY), n.NY);
CK("T-AR1 Arkansas: applied here from 65", /applied here from 65\b/.test(n.AR), n.AR);
CK("T-AR2 Arkansas: the law's split — IRAs from 59½, employer plans at any age; conservative", /from 59½ for IRAs/.test(n.AR) && /at any age for employer plans/.test(n.AR) && /\(conservative\)/.test(n.AR), n.AR);
CK("T-GA1 Georgia: applied here from 65 only", /applied here from 65 only/.test(n.GA), n.GA);
CK("T-GA2 Georgia: the law's $35K at 62–64 is named as NOT modelled; conservative", /\$35K at 62–64 is not modelled/.test(n.GA) && /\(conservative\)/.test(n.GA), n.GA);
CK("T-IA1 Iowa: applied here at any age", /applied here at any age/.test(n.IA), n.IA);
CK("T-IA2 Iowa: the law's 55 (or disability, or survivor), per person; optimistic, with the direction spelled out", /only from 55/.test(n.IA) && /disability/.test(n.IA) && /survivor/.test(n.IA) && /per person/.test(n.IA) && /understates Iowa tax \(optimistic\)/.test(n.IA) && !/55\s*\+/.test(n.IA), n.IA);
CK("T-PA1 Pennsylvania: applied here at any age", /applied here at any age/.test(n.PA), n.PA);
CK("T-PA2 Pennsylvania: IRAs from 59½, employer plans at the plan's own age or service; optimistic", /IRA distributions only from 59½/.test(n.PA) && /plan's own retirement age or service/.test(n.PA) && /understates Pennsylvania tax \(optimistic\)/.test(n.PA) && !/59½\s*\+/.test(n.PA), n.PA);
CK("T-OK1 Oklahoma: applied here from 65, per person, and claims NO law age (not settled from a primary source)", /applied here from 65\b/.test(n.OK) && /per person/.test(n.OK) && /not verified/.test(n.OK) && !/law/.test(n.OK), n.OK);

// ── M · the model does what each disclosure says — dollar-exact by hand, so a note and the engine cannot drift apart ─────
// When D-24 age-gates Iowa or Pennsylvania, M-IA/M-PA fail ON PURPOSE: the note must change in the same release (OPERATIONS §B2).
EQ("M-NY1 NY 64: no exclusion — 6 % × $50,000 = $3,000", tax("NY", 64), 3000);
EQ("M-NY2 NY 59 (inside the law's 59½+ only next year, outside the model's 65): 6 % × $50,000 = $3,000", tax("NY", 59), 3000);
EQ("M-NY3 NY 65: $20,000 excluded — 6 % × $30,000 = $1,800", tax("NY", 65), 1800);
EQ("M-AR1 AR 60: no exclusion — 3.9 % × $50,000 = $1,950", tax("AR", 60), 1950);
EQ("M-AR2 AR 65: $6,000 excluded — 3.9 % × $44,000 = $1,716", tax("AR", 65), 1716);
EQ("M-GA1 GA 63: no $35K tier — 5.19 % × $50,000 = $2,595", tax("GA", 63), 2595);
EQ("M-GA2 GA 65: $65,000 cap covers it — $0", tax("GA", 65), 0);
EQ("M-IA1 IA 50: exempt below the law's 55 — $0 (the disclosed optimism)", tax("IA", 50), 0);
EQ("M-PA1 PA 50: exempt below the law's 59½ — $0 (the disclosed optimism)", tax("PA", 50), 0);
EQ("M-OK1 OK 64: no exclusion — 4.75 % × $50,000 = $2,375", tax("OK", 64), 2375);
EQ("M-OK2 OK 65: $10,000 excluded — 4.75 % × $40,000 = $1,900", tax("OK", 65), 1900);

// ── X · extinction: across ALL rows, a note names only the age the model applies, or carries a TRUE disclosure ───────────
// An age mention is a 2-digit 50–75 with a qualifier: "NN+", "NN½+", "NN–NN", "from/at (age) NN", "aged NN", "under NN".
// `$`, `§` and digit/decimal contexts are not ages (Utah's §59-10-1042 was the false positive found at scope time).
const AGES = s => { const out = []; const re = /\b(under\s+|from\s+(?:age\s+)?|at\s+(?:age\s+)?|aged?\s+)?(\d{2})(½)?(\s*\+|\s*[–-]\s*\d{2}\b)?/g; let m;
  while ((m = re.exec(s))) { const pre = s[m.index - 1]; if (pre === "$" || pre === "§" || pre === "." || pre === "," || /\d/.test(pre || "")) continue;
    if (/^(\d|,\d|%|K)/.test(s.slice(m.index + m[0].length, m.index + m[0].length + 2))) continue;
    if (!m[1] && !m[4]) continue; const v = +m[2] + (m[3] ? 0.5 : 0); if (v < 50 || v > 75) continue;
    out.push({ v, under: /^under/.test(m[1] || ""), t: m[0].trim() }); } return out; };
const rows = Object.keys(SR); const x1 = [], x2 = [], x3 = []; let named = 0;
for (const c of rows) { const r = SR[c], s = r.note || "", M = MODEL_AGE(r), a = AGES(s); if (a.length) named++;
  const d = s.match(DISCLOSE);
  if (d) { const dv = d[1] ? +d[1] : 0; if (dv !== M) x2.push(`${c}: says ${d[1] || "any age"}, model ${M || "any age"}`); }
  else { const ok = new Set([M, r.ssRule && r.ssRule.fullAge, r.ssRule && r.ssRule.midAge, r.ssRule && r.ssRule.ageMin].filter(v => v !== undefined && v !== null));
    for (const e of a) if (e.under ? e.v !== M : !ok.has(e.v)) x1.push(`${c} "${e.t}" vs model ${M || "any age"}`); }
  if (r.excl65 > 0 && !a.length && !/any age/i.test(s)) x3.push(c); }
CK(`X-0 all ${rows.length} rows read (51 jurisdictions)`, rows.length === 51, rows.length);
CK("X-1 no note names an age the model does not apply, unless it says \"applied here …\"", x1.length === 0, x1.join(" · "));
CK("X-2 every \"applied here …\" disclosure states the model's real age (retExempt → any age; else exclAge ?? 65)", x2.length === 0, x2.join(" · "));
CK("X-3 every row with a dollar exclusion names the age it is applied from (or \"any age\") — none silent", x3.length === 0, x3.join(" "));
CK(`X-4 not vacuous: at least 18 rows name an age (§B2 empty-set guard; ${named} do)`, named >= 18, named);
CK("X-5 exactly the six rewritten rows carry the disclosure phrase", rows.filter(c => DISCLOSE.test(note(c))).sort().join(",") === "AR,GA,IA,NY,OK,PA", rows.filter(c => DISCLOSE.test(note(c))).join(","));
const { NOTE_MATCHER } = require(SETS);
CK("X-6 none of the six enters the income-limited set (NOTE_MATCHER)", ["NY", "AR", "GA", "IA", "PA", "OK"].every(c => !NOTE_MATCHER.test(note(c))));

// ── D · the display: My Data carries the new note (one conservative, one optimistic, one tier) ─────────────────────────
const body = () => window.document.body;
let root, act, DangerClose, el;
const flush = async () => { try { await act(async () => { await new Promise(r => setTimeout(r, 40)); }); } catch (e) {} };
const click = async (x) => { if (!x) return false; try { await act(async () => { x.dispatchEvent(new window.MouseEvent("click", { bubbles: true, cancelable: true })); }); } catch (e) {} await flush(); return true; };
const tabBtn = (name) => [...body().querySelectorAll("button.tab")].find(b => b.textContent.trim() === name);
const stateSelect = () => [...body().querySelectorAll("select")].find(s => [...s.options].some(o => o.value === "ME"));
const pick = async (code) => {
  const s = stateSelect(); if (!s) return false;
  try { await act(async () => { Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set.call(s, code); s.dispatchEvent(new window.Event("change", { bubbles: true })); }); } catch (e) {}
  await flush(); return true;
};
const modelLine = () => { const d = [...body().querySelectorAll("div")].filter(x => /^Model[ :(]/.test(x.textContent || "") && /effective rate/.test(x.textContent || ""));
  return d.length ? d.sort((a, b) => a.textContent.length - b.textContent.length)[0].textContent : ""; };
{
  window.localStorage.clear();
  el = window.document.createElement("div"); body().appendChild(el);
  ({ root, act, DangerClose } = window.__mount(el));
  try { await act(async () => { root.render(React.createElement(DangerClose)); }); } catch (e) {}
  await flush(); await flush();
  const example = [...body().querySelectorAll("button, div")].filter(x => /use example data/i.test(x.textContent || "") && x.children.length === 0)[0];
  await click(example); await flush();
  await click(tabBtn("my data")); await flush();
  CK("D-0 setup — My Data shows a state selector", !!stateSelect());
  await pick("NY"); const ny = modelLine();
  CK("D-1 New York's line says the model applies it from 65 and the law from 59½", /applied here from 65, although the law allows it from 59½/.test(ny) && !/59½\+/.test(ny), ny.slice(0, 220));
  await pick("PA"); const pa = modelLine();
  CK("D-2 Pennsylvania's line says the model applies it at any age and is optimistic", /applied here at any age/.test(pa) && /\(optimistic\)/.test(pa), pa.slice(0, 260));
  await pick("GA"); const ga = modelLine();
  CK("D-3 Georgia's line says the 62–64 tier is not modelled", /\$35K at 62–64 is not modelled/.test(ga), ga.slice(0, 220));
  try { await act(async () => { root.unmount(); }); } catch (e) {}
}
done();
