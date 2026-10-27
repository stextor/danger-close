#!/usr/bin/env python3
"""controls_v633_table_year.py — negative controls for t96 (and t29's new census row, and t44's frozen top tier)
(docs/SCOPE_TY2027_REFRESH_V633_V634.md §3). REPO-ONLY (release-pinned).
Coverage DEMONSTRATED (OPERATIONS §B2): each planted defect must turn its named check(s) red. Each target occurs exactly once in its file; a
source mutant is compiled as mk_runfolder.sh builds it (qa/mk_testable.sh for the app module, esbuild for the DOM bundle), the named suite
runs on the v6.33 leg, then ./v633.jsx, ./METHODOLOGY.md, qa/tools/boundaries.mjs, qa/app_v633.mjs and qa/dom_v633.cjs are RESTORED and
hash-checked.
Run from the ROOT of a COPY of a v632 -> v633 run folder:  python3 qa/tools/controls_v633_table_year.py [C1 ...]
    C1  a base year back on inflateTaxConst, and Engine B passing the as-of year ................. A-1, A-2, B-1, D-1, D-2, D-3
    C2  …and Engine A passing it .................................................................. A-1, A-2, B-1
    C3  a base year back on irmaaThresholdFor / irmaaTierFor, and Engine C's placement passing it . A-1, A-2, A-4e, B-1, B-5
    C4  projectBracketsAt taking the as-of year again ............................................. A-1, A-2, B-3
    C5  the Roth tab's IRMAA threshold passing the as-of year ..................................... A-1, A-2, B2-1
    C6  an Engine A irmaaTierFor caller passing the as-of year .................................... A-1, A-2, A-4e, B-1
    C7  Engine C's surcharge grown by the dollar clock again ....................................... A-3, B-1
    C8  the wage base read from the 2026 table and indexed from the as-of year (Engine B) .......... A-1, A-2, A-5, B-1
    C9  the IRMAA top tier's freeze removed (the carve-out) ........................................ A-4h, A-4i, A-4j, B-16 (t96); A-1, A-2 (t44)
    C10 the Taxes tab's "grow from {as-of year}" sentence back .................................... E-8
    C11 METHODOLOGY's v6.33 heading changed ....................................................... E-4
    C12 TAX_CONSTANTS_YEAR typed again ............................................................ A-7
    C13 the bracket panel drawn on Single bounds (F-28) ........................................... A-9, F-1
    C14 the ACA table read for 2026 whatever the coverage year .................................... A-4g
    C15 the no-deflation clamp put back (DT-2 as first decided) ..................................... A-4h, B-8, C-1
    C18 a base year back on seniorExtraFor, and Engine B passing the as-of year ................... A-1, A-2, B-1, D-2
    C19 the top tier indexed from 2027 whatever its table's year ................................. A-4j
    C20 the Roth tab's bracket bar back on the 2026 table, unindexed (F-28) ....................... A-6, F-3
    C16 the Events notice never naming a family's year ............................................ E-2
    C17 the census's asof_table_year row always ON (t29) ........................................... C-table-1
    C0  unmutated ................................................................................. t96 passes
"""
import hashlib, os, re, subprocess, sys
ROOT = os.getcwd(); QA = os.path.join(ROOT, "qa")
SRC = os.path.join(ROOT, "v633.jsx"); METH = os.path.join(ROOT, "METHODOLOGY.md"); BND = os.path.join(QA, "tools", "boundaries.mjs")
T96 = os.path.join(QA, "t96_table_year.mjs"); T29 = os.path.join(QA, "t29_boundaries.mjs"); T44 = os.path.join(QA, "t44_irmaa_top_tier.mjs")
MOD = os.path.join(QA, "app_v633.mjs"); DOM = os.path.join(QA, "dom_v633.cjs")
for p in (SRC, METH, BND, T96, T29, T44, MOD, DOM, os.path.join(QA, "mk_testable.sh"), os.path.join(QA, "dom_entry_v633.jsx"), os.path.join(QA, "shim.txt"),
          os.path.join(QA, "app_v632.mjs"), os.path.join(QA, "dom_v632.cjs")):
    if not os.path.exists(p): sys.exit(f"run from the ROOT of a v632 -> v633 run folder copy (missing {p})")
ITC = ("const inflateTaxConst = (base, yr) =>\n  base === Infinity ? Infinity : base * Math.pow(1 + chainedCpiRate(), yr - fedTableYear(yr));",
       "const inflateTaxConst = (base, yr, baseYr = fedTableYear(yr)) =>\n  base === Infinity ? Infinity : base * Math.pow(1 + chainedCpiRate(), yr - baseYr);")
THR = [("const irmaaThresholdFor = (upper, isTopTier, premiumYr) => {", "const irmaaThresholdFor = (upper, isTopTier, premiumYr, baseYr = irmaaTableYear(premiumYr)) => {"),
       ("    : premiumYr - irmaaTableYear(premiumYr);", "    : premiumYr - baseYr;")]
TIER = [("const irmaaTierFor = (magi, uppers, premiumYr) => {", "const irmaaTierFor = (magi, uppers, premiumYr, baseYr) => {"),
        ("    const thr = irmaaThresholdFor(uppers[i], top, premiumYr);", "    const thr = irmaaThresholdFor(uppers[i], top, premiumYr, baseYr);")]
S = lambda pairs: [(SRC, a, b) for a, b in pairs]
M = {
 "C0": ("unmutated", [], [], "t96"),
 "C1": ("a base year back on inflateTaxConst; Engine B passes the as-of year", S([ITC,
        ("  const inflate = (base, yr) => inflateTaxConst(base, yr);", "  const inflate = (base, yr) => inflateTaxConst(base, yr, _asOfYr);")]),
        ["A-1", "A-2", "B-1", "D-1", "D-2", "D-3"], "t96"),
 "C2": ("…and Engine A passes it", S([ITC, ("  const infl = (b, yr) => inflateTaxConst(b, yr);", "  const infl = (b, yr) => inflateTaxConst(b, yr, P.asOfYr);")]), ["A-1", "A-2", "B-1"], "t96"),
 "C3": ("a base year back on the IRMAA helpers; Engine C's placement passes the as-of year", S(THR + TIER + [
        ("    return irmaaTierFor(magi, tiersFor(filingSingleI, magiYr + 2).map(t => t.magiUpper), magiYr + 2);",
         "    return irmaaTierFor(magi, tiersFor(filingSingleI, magiYr + 2).map(t => t.magiUpper), magiYr + 2, _asOfYr);")]),
        ["A-1", "A-2", "A-4e", "B-1", "B-5"], "t96"),
 "C4": ("projectBracketsAt takes the as-of year again", S([ITC,
        ("function projectBracketsAt(year, { filingSingle, survivorIsA, ageA, ageB }) {", "function projectBracketsAt(year, { asOfYr, filingSingle, survivorIsA, ageA, ageB }) {"),
        ("    stdDed: Math.round(inflateTaxConst(std, year)) + senior,", "    stdDed: Math.round(inflateTaxConst(std, year, asOfYr)) + senior,")]), ["A-1", "A-2", "B-3"], "t96"),
 "C5": ("the Roth tab's IRMAA threshold passes the as-of year", S(THR + [
        ("irmaaTableFor(irmaaYear).SGL : irmaaTableFor(irmaaYear).MFJ)[0], false, irmaaYear));", "irmaaTableFor(irmaaYear).SGL : irmaaTableFor(irmaaYear).MFJ)[0], false, irmaaYear, _tlRoth.asOfYear));")]),
        ["A-1", "A-2", "B2-1"], "t96"),
 "C6": ("an Engine A irmaaTierFor caller passes the as-of year", S(THR + TIER + [
        ("          const tier = irmaaTierFor(lookM, ups, yr);", "          const tier = irmaaTierFor(lookM, ups, yr, P.asOfYr);")]), ["A-1", "A-2", "A-4e", "B-1"], "t96"),
 "C7": ("Engine C's surcharge grown by the dollar clock", S([("    const surchargeAnnual = irmaaSurchargeFor(tier, personsOnMedicare, irmaaYr);",
        "    const surchargeAnnual = _TT[tier].surchargePerPerson * personsOnMedicare * _kY(irmaaYr);")]), ["A-3", "B-1"], "t96"),
 "C8": ("the wage base from the 2026 table, indexed from the as-of year (Engine B)", S([
        ("const inflateWageBase = (base, yr) => base * Math.pow(1 + cpiuRate(), yr - heldTableYear(WAGE_BASE_TABLES, yr));",
         "const inflateWageBase = (base, yr, baseYr = heldTableYear(WAGE_BASE_TABLES, yr)) => base * Math.pow(1 + cpiuRate(), yr - baseYr);"),
        ("    const wageBase = wageBaseFor(yr);", "    const wageBase = inflateWageBase(TAX_CONSTS.SS_WAGE_BASE, yr, _asOfYr);")]), ["A-1", "A-2", "A-5", "B-1"], "t96"),
 "C9": ("the top tier's freeze removed", S([("  const exp = isTopTier\n    ? Math.max(0, premiumYr - Math.max(IRMAA_CONSTS.TOP_TIER_FROZEN_THROUGH, irmaaTableYear(premiumYr)))\n    : premiumYr - irmaaTableYear(premiumYr);",
        "  const exp = premiumYr - irmaaTableYear(premiumYr);")]), ["A-4h", "A-4i", "A-4j", "B-16"], "t96"),
 "C9b": ("the top tier's freeze removed (t44)", S([("  const exp = isTopTier\n    ? Math.max(0, premiumYr - Math.max(IRMAA_CONSTS.TOP_TIER_FROZEN_THROUGH, irmaaTableYear(premiumYr)))\n    : premiumYr - irmaaTableYear(premiumYr);",
        "  const exp = premiumYr - irmaaTableYear(premiumYr);")]), ["A-1", "A-2"], "t44"),
 "C10": ("the Taxes tab's grow-from-as-of sentence back", S([("are the IRS's published figures for each year it has published ({Object.keys(FED_TABLES).join(\", \")}) and, after {TAX_CONSTANTS_YEAR}, grow from the {TAX_CONSTANTS_YEAR} figures (a row before {Math.min(...Object.keys(FED_TABLES).map(Number))} deflates them) — from the year they were published for, whatever date the plan carries — at the chained-CPI rate the law indexes them by: the plan's inflation",
        "grow from {_asOfYr} at the chained-CPI rate the law indexes them by — the plan's inflation")]), ["E-8"], "t96"),
 "C11": ("METHODOLOGY's v6.33 heading changed", [(METH, "## The tables index from their own year (v6.33)", "## The tables index from their own year")], ["E-4"], "t96"),
 "C12": ("TAX_CONSTANTS_YEAR typed again", S([("const TAX_CONSTANTS_YEAR = Math.max(...Object.keys(FED_TABLES).map(Number));", "const TAX_CONSTANTS_YEAR = 2026;")]), ["A-7"], "t96"),
 "C13": ("the bracket panel on Single bounds", S([("for (const b of taxFactsFor(sel.filingSingle, sel.yr).br) {", "for (const b of taxFactsFor(true, sel.yr).br) {")]), ["A-9", "F-1"], "t96"),
 "C14": ("the ACA table read for 2026 whatever the year", S([("ACA_CONSTS.tableCurrentByCoverageYear[acaTableYear(coverageYear)])", "ACA_CONSTS.tableCurrentByCoverageYear[2026])")]), ["A-4g"], "t96"),
 "C15": ("the no-deflation clamp put back (DT-2 as first decided)", S([("base * Math.pow(1 + chainedCpiRate(), yr - fedTableYear(yr));", "base * Math.pow(1 + chainedCpiRate(), Math.max(0, yr - fedTableYear(yr)));")]), ["A-4h", "B-8", "C-1"], "t96"),
 "C18": ("a base year back on seniorExtraFor, and Engine B passing the as-of year", S([ITC,
        ("const seniorExtraFor = (filingSingle, ageA, ageB, yr, filerIsA) =>", "const seniorExtraFor = (filingSingle, ageA, ageB, yr, filerIsA, baseYr) =>"),
        ("fedTableFor(yr).SENIOR_EXTRA_SGL : fedTableFor(yr).SENIOR_EXTRA_MFJ, yr));", "fedTableFor(yr).SENIOR_EXTRA_SGL : fedTableFor(yr).SENIOR_EXTRA_MFJ, yr, baseYr));"),
        ("    const seniorBase = seniorExtraFor(effSingle, ageA, ageB, yr, _survivorIsA);", "    const seniorBase = seniorExtraFor(effSingle, ageA, ageB, yr, _survivorIsA, _asOfYr);")]),
        ["A-1", "A-2", "B-1", "D-2"], "t96"),
 "C19": ("the top tier indexed from 2027 whatever its table's year (not v6.34-ready)", S([("Math.max(0, premiumYr - Math.max(IRMAA_CONSTS.TOP_TIER_FROZEN_THROUGH, irmaaTableYear(premiumYr)))",
        "Math.max(0, premiumYr - IRMAA_CONSTS.TOP_TIER_FROZEN_THROUGH)")]), ["A-4j"], "t96"),
 "C20": ("the Roth tab's bracket bar back on the 2026 table, unindexed", S([("const _brU = projectBrackets(rows[0]?.year || retireYear).brackets;",
        "const _brU = _singleR ? TAX_CONSTS.SGL_BR : TAX_CONSTS.MFJ_BR;")]), ["A-6", "F-3"], "t96"),
 "C16": ("the Events notice never naming a family's year", S([("    const _lead = _fam.every(([, y]) => y === TAX_CONSTANTS_YEAR)", "    const _lead = true")]), ["E-2"], "t96"),
 "C17": ("the census row always ON", [(BND, "\"the as-of year is the year of the table the first row reads\", _as === _ty,", "\"the as-of year is the year of the table the first row reads\", true,")], ["C-table-1"], "t29"),
}
cid = lambda l: (re.match(r"  ✗ ([A-Z][A-Z0-9]*-[a-z0-9]+(?:-\d+)?)\b", l) or [None, None])[1]
md5 = lambda p: hashlib.md5(open(p, "rb").read()).hexdigest()
FILES = (SRC, METH, BND)
ORIG = {p: open(p, "rb").read() for p in FILES}
WATCH = (SRC, METH, BND, T96, T29, T44, MOD, DOM); BEFORE = tuple(md5(p) for p in WATCH)
def build():
    subprocess.run(["bash", os.path.join(QA, "mk_testable.sh"), "v633"], cwd=ROOT, capture_output=True, text=True, check=True)
    subprocess.run(["npx", "esbuild", "qa/dom_entry_v633.jsx", "--bundle", "--format=cjs", "--platform=browser", "--loader:.jsx=jsx", "--jsx=automatic",
                    "--outfile=qa/dom_v633.cjs", "--log-level=error"], cwd=ROOT, capture_output=True, text=True, check=True)
def run(label):
    desc, pairs, want, suite = M[label]
    script = {"t96": "t96_table_year.mjs", "t29": "t29_boundaries.mjs", "t44": "t44_irmaa_top_tier.mjs"}[suite]
    try:
        if pairs:
            texts = {p: ORIG[p].decode("utf-8") for p in ORIG}
            for path, old, new in pairs:
                if texts[path].count(old) != 1: return f"{label} TARGET occurs {texts[path].count(old)}x (must be 1) — control INVALID"
                texts[path] = texts[path].replace(old, new)
            for path in ORIG:
                if texts[path].encode("utf-8") != ORIG[path]: open(path, "w", encoding="utf-8").write(texts[path])
            if open(SRC, "rb").read() != ORIG[SRC]: build()
        r = subprocess.run(["node", script, "v633"], cwd=QA, capture_output=True, timeout=3600)
        out = r.stdout.decode("utf-8", "replace"); failed = [l for l in out.splitlines() if l.startswith("  ✗ ")]
        tally = re.search(rf"{suite} SUITE \(v633\): (\d+) passed, (\d+) failed", out) or re.search(rf"{suite}[^\n]*?(\d+) passed, (\d+) failed", out)
        if label == "C0": return f"C0 {'OK' if r.returncode == 0 and tally and tally.group(2) == '0' else 'BAD'} unmutated: {tally.group(0) if tally else 'no tally'}"
        if not tally: return f"{label} CRASHED — {desc}: {r.stderr.decode('utf-8','replace')[-300:]}"
        miss = [w for w in want if not any(cid(l) == w for l in failed)]
        extra = sorted({cid(l) or l.strip()[:60] for l in failed} - set(want))
        return f"{label} {'FIRES' if not miss else 'MISSED ' + str(miss)} — {desc}; red: {len(failed)}" + (f" (also: {' | '.join(extra)})" if extra else "")
    finally:
        for p in (METH, BND):
            if open(p, "rb").read() != ORIG[p]: open(p, "wb").write(ORIG[p])
        if open(SRC, "rb").read() != ORIG[SRC]:
            open(SRC, "wb").write(ORIG[SRC]); build()
labels = sys.argv[1:] or list(M)
out = []
for l in labels: out.append(run(l)); print(out[-1], flush=True)
ok = tuple(md5(p) for p in WATCH) == BEFORE
print(f"restored: {'yes' if ok else 'NO — STOP'} (" + " / ".join(h[:8] + "…" for h in BEFORE) + ")")
fires = sum(1 for o in out if " FIRES " in o or o.startswith("C0 OK"))
print(f"controls: {fires} of {len(out)} as expected"); sys.exit(0 if ok and fires == len(out) else 1)
