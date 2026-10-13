#!/usr/bin/env python3
"""peer_scf.py — the Ranking tab's peer figures, computed from the Fed's SCF Summary Extract Public Data.

usage:  python3 qa/tools/peer_scf.py <SCFPyyyy.csv or scfpyyyyexcel.zip> <year> [--json out.json]

Added at v6.10 (docs/SCOPE_PEER_DATA_SCF2025_V610.md). NOT a suite: it asserts nothing about the app and is counted in
no release total. It is the reproducible derivation behind every SCF figure the Ranking tab shows, so a later
session can re-derive them instead of trusting hand-typed numbers (the 2022 percentile cut-offs had no recorded
derivation at all, which is why this exists).

METHOD — from the Fed's own summary-variable macro (econres/files/bulletin.macro.txt):
  · WGT is already X42001/5 — "divide weight by 5 so totals estimated on the 5 implicates jointly are correct".
    So every statistic is computed on ALL FIVE implicates POOLED, weighted by WGT. No per-implicate averaging.
  · AGECL = 1 + (AGE>=35) + (AGE>=45) + (AGE>=55) + (AGE>=65) + (AGE>=75), so AGECL 4 is ages 55–64.
  · Dollars are the survey year's own dollars, as the extract publishes them. Nothing is re-indexed here.
  · Weighted quantile: the smallest value whose cumulative weight reaches the target share of total weight
    (the inverse of the weighted empirical CDF; no interpolation).

THE ORACLE. Before printing anything, the computed median and mean net worth for ages 55–64 must agree with the
Fed's PUBLISHED figures for that year. The Bulletin is computed on INTERNAL data and the extract is the PUBLIC
data, so they are not expected to be identical; the tolerance is ORACLE_TOL and the actual gap is always printed.
A failure exits non-zero and prints no figures.
"""
import csv, io, json, sys, zipfile

# Published age 55–64 net worth, thousands of SURVEY-YEAR dollars.
#   2025: Fed Bulletin "Changes in U.S. Family Finances from 2022 to 2025", Table 2 — median 411.9, mean 1,878.0.
#   2022: the figures v6.09 carried (364,500 / 1,566,900), which the 2025 Bulletin restates as 398.9 / 1,714.7 in
#         2025 dollars — a common ratio of 1.0944 / 1.0943, i.e. one price adjustment of the same pair.
ORACLE = {2025: (411.9, 1878.0), 2022: (364.5, 1566.9)}
ORACLE_TOL = 0.02          # 2% — public vs internal data; the gap is printed whatever it is


def load(path):
    if path.lower().endswith(".zip"):
        z = zipfile.ZipFile(path)
        names = [n for n in z.namelist() if n.lower().endswith(".csv")]
        if len(names) != 1:
            sys.exit(f"FATAL: expected exactly one .csv in {path}, found {names}")
        text = io.TextIOWrapper(z.open(names[0]), encoding="utf-8-sig", newline="")
    else:
        text = open(path, encoding="utf-8-sig", newline="")
    rd = csv.DictReader(text)
    cols = {c.strip().upper(): c for c in rd.fieldnames}
    need = ["Y1", "YY1", "WGT", "AGE", "AGECL", "NETWORTH", "FIN", "RETQLIQ", "HRETQLIQ", "DEBT", "HDEBT", "NH_MORT"]
    miss = [n for n in need if n not in cols]
    if miss:
        sys.exit(f"FATAL: column(s) missing from the extract: {miss}. Have: {sorted(cols)[:40]}…")
    rows = []
    for r in rd:
        rows.append({n: float(r[cols[n]]) for n in need})
    return rows


def wq(pairs, q):
    """Weighted quantile: smallest x with cumulative weight >= q * total."""
    pairs = sorted(pairs)
    tot = sum(w for _, w in pairs)
    acc = 0.0
    for x, w in pairs:
        acc += w
        if acc >= q * tot:
            return x
    return pairs[-1][0]


def wmean(pairs):
    return sum(x * w for x, w in pairs) / sum(w for _, w in pairs)


def wshare(rows, pred):
    tot = sum(r["WGT"] for r in rows)
    return sum(r["WGT"] for r in rows if pred(r)) / tot


def compute(rows, year):
    # structural checks — five implicates per family, the AGECL rule above, and weights as the macro defines them
    fam = {}
    for r in rows:
        fam.setdefault(int(r["YY1"]), set()).add(int(r["Y1"]))
    bad = [k for k, v in fam.items() if len(v) != 5]
    if bad:
        sys.exit(f"FATAL: {len(bad)} families do not have exactly five implicates (e.g. YY1={bad[0]})")
    agecl_bad = sum(1 for r in rows if int(r["AGECL"]) != 1 + (r["AGE"] >= 35) + (r["AGE"] >= 45) + (r["AGE"] >= 55) + (r["AGE"] >= 65) + (r["AGE"] >= 75))
    if agecl_bad:
        sys.exit(f"FATAL: {agecl_bad} rows whose AGECL does not follow the macro's rule")

    a = [r for r in rows if int(r["AGECL"]) == 4]                     # ages 55–64
    nw = [(r["NETWORTH"], r["WGT"]) for r in a]
    ret_h = [(r["RETQLIQ"], r["WGT"]) for r in a if r["HRETQLIQ"] == 1]
    debt_h = [(r["DEBT"], r["WGT"]) for r in a if r["HDEBT"] == 1]
    fin = [(r["FIN"], r["WGT"]) for r in a]
    sixty = [r for r in rows if r["AGE"] >= 60]

    out = {
        "year": year,
        "families_total": len(fam), "rows_total": len(rows), "rows_55_64": len(a),
        "medianNetWorth": wq(nw, 0.50), "meanNetWorth": wmean(nw),
        "nwP75": wq(nw, 0.75), "nwP875": wq(nw, 0.875), "nwP90": wq(nw, 0.90), "nwP95": wq(nw, 0.95),
        "finP90": wq(fin, 0.90), "finP95": wq(fin, 0.95),
        "medianRetSavings": wq(ret_h, 0.50), "meanRetSavings": wmean(ret_h),
        "pctHoldRet": 100 * wshare(a, lambda r: r["HRETQLIQ"] == 1),
        "medianHHDebt": wq(debt_h, 0.50), "meanHHDebt": wmean(debt_h),
        "pctLessThan100K": 100 * wshare(a, lambda r: r["RETQLIQ"] < 100000),
        "pctMortgage60plus": 100 * wshare(sixty, lambda r: r["NH_MORT"] > 0),
    }
    return out


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    path, year = sys.argv[1], int(sys.argv[2])
    if year not in ORACLE:
        sys.exit(f"FATAL: no published oracle recorded for {year} — add the Fed's figures to ORACLE first")
    o = compute(load(path), year)
    pm, pn = ORACLE[year]
    gm = o["medianNetWorth"] / 1000 / pm - 1
    gn = o["meanNetWorth"] / 1000 / pn - 1
    print(f"ORACLE {year} age 55-64 net worth: median {o['medianNetWorth']/1000:.1f}K vs published {pm}K ({gm:+.2%}); "
          f"mean {o['meanNetWorth']/1000:.1f}K vs published {pn}K ({gn:+.2%}); tolerance ±{ORACLE_TOL:.0%}")
    if abs(gm) > ORACLE_TOL or abs(gn) > ORACLE_TOL:
        print("ORACLE FAILED — no figures printed")
        sys.exit(1)
    for k, v in o.items():
        print(f"  {k:20s} {v:,.2f}" if isinstance(v, float) else f"  {k:20s} {v}")
    if "--json" in sys.argv:
        json.dump(o, open(sys.argv[sys.argv.index("--json") + 1], "w"), indent=1, sort_keys=True)


if __name__ == "__main__":
    main()
