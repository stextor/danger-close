#!/bin/bash
# NEGATIVE CONTROLS (OPERATIONS §B2) — v5.36 session-2 edition, SELF-CONTAINED.
# Adopted-for-repo form: the patch payloads are embedded below rather than read from /tmp,
# so the file cannot lose its patches between sessions (which is exactly what happened to
# the session-1 copy). Each control reverts one part of the v5.36 capital-gains work,
# rebuilds, MEASURES that engine output actually moved (a no-op patch proves nothing),
# then runs the engine suites and reports CAUGHT / NOT CAUGHT / DIED — exit status is
# checked because a dead suite prints no "N failed" line at all (§B2, learned twice).
set -u
cd "$(dirname "$0")/.."
SRC=v536.jsx
cp $SRC /tmp/ctl.orig.jsx
PDIR=$(mktemp -d)

# ── fingerprint: Engine D (gain/magi/end-wealth) AND Engines B (totAll) / C (totalIrmaa),
#    the latter two fed a gainByYr built from D's schedule exactly as the app's call sites
#    do — so reverting B's wiring or C's MAGI term visibly MOVES the fingerprint.
measure () {
  node --input-type=module -e '
    const m = await import("./qa/app_v536.mjs"); const g = m.__g;
    const F = (n) => (m.__engines && m.__engines[n]) || g[n];   // engines live on __engines
    const P0 = JSON.parse(JSON.stringify(g.PORTFOLIO()));
    const mk = (tt, bal, pension) => { const P = JSON.parse(JSON.stringify(P0));
      P.otherAccounts = tt ? [{ name: "X", balance: bal, owner: "A", taxType: tt }] : [];
      P.household = (P.total401k || 0) + bal; P.taxableGainPct = 40;
      if (pension) { P.single = false; P.lifeExpA = 95; P.lifeExpB = 95;
        const z = { tableByAge: { 62:0,63:0,64:0,65:0,67:0,70:0 }, planned: 0, plannedAge: 67 };
        P.incomeSources = { ssA: {...z}, ssB: {...z}, pension: { amount: 150000/12 } }; }
      return P; };
    const out = [];
    for (const [tt, bal, pen] of [["trad",600000,true],["trad",600000,false],[null,400000,false],[null,400000,true]]) {
      g.applyLoadedData({ portfolio: mk(tt, bal, pen) });
      const ry = g.PLAN_TIMELINE().targetRetireYear;
      const r = g.computeWithdrawalPlan({ retireYear: ry, rothAmount: 0, scenarioPreset: "base" });
      const gain = r.schedule.reduce((s,x)=>s+(x.capGain_y||0),0);
      const magi = r.schedule.reduce((s,x)=>s+(x.magi||0),0);
      const endw = r.schedule[r.schedule.length-1].portfolioTotal;
      // SYNTHETIC series for B/C: $50K/yr regardless of what D sold. The B/C fingerprint
      // components test THEIR consumption of a gain series; coupling them to the actual
      // sales of D made C8/C9 invisible whenever the household covered expenses, meaning
      // no sale, or realized gain below the 0% LTCG band, meaning no tax. Measured.
      // NOTE this comment must stay apostrophe-free: it lives inside a bash single-quote.
      const gby = {}; for (const x of r.schedule) gby[x.yr] = 50000;
      g.applyLoadedData({ portfolio: mk(tt, bal, pen) });
      const b = F("computeTaxPlan")({ retireYear: ry, rothAmount: 0, qcdAnnual: 0, taxYield: 0, gainByYr: gby });
      g.applyLoadedData({ portfolio: mk(tt, bal, pen) });
      const c = F("computeIrmaaPlan")({ retireYear: ry, rothAmount: 0, qcdAnnual: 0, taxYield: 0, gainByYr: gby });
      out.push([Math.round(gain),Math.round(magi),Math.round(endw),Math.round(b.totAll),Math.round(c.totalIrmaa)].join("/"));
    }
    console.log(out.join(" | "));
  ' 2>/tmp/ctl.probe.err
}

rebuild () { cp $SRC DangerClose.jsx; ./qa/mk_testable.sh v536 >/dev/null 2>&1; cp qa/app_v536.mjs qa/app_testable.mjs; }

# ── embedded patches: each asserts its anchor appears EXACTLY ONCE before replacing ──
mkpatch () { cat > "$PDIR/$1.py" << PYEOF
import sys
src = open("v536.jsx").read()
OLD = $2
NEW = $3
n = src.count(OLD)
if n != 1:
    print(f"anchor count {n} != 1", file=sys.stderr); sys.exit(1)
open("v536.jsx","w").write(src.replace(OLD, NEW))
PYEOF
}
mkpatch c1 '"const _saleFromGain = _spendFromTaxable * _gainShareOfPool;"' \
           '"const _saleFromGain = drawFromTaxable * _gainShareOfPool;"'
mkpatch c2 '"let taxGainPool = Math.max(0, Math.min(_taxInit, _gainPoolInit));"' \
           '"let taxGainPool = _taxInit;"'
mkpatch c3 '"const _ordFrac = _poolPostRmd > 0 ? Math.min(1, Math.max(0, taxOrd - _sleeveRmdDraw) / _poolPostRmd) : 0;"' \
           '"const _ordFrac = _taxBoy > 0 ? Math.min(1, Math.max(0, taxOrd - _sleeveRmdDraw) / _taxBoy) : 0;"'
mkpatch c4 '"gainBasis += rmdToTaxable;"' '""'
mkpatch c5 '"taxGainPool = Math.min(taxable, taxGainPool * (1 + growth.tax));"' \
           '"taxGainPool = Math.min(taxable, taxGainPool);"'
mkpatch c6 '"+ conv_y + capGain_y; // tax-free streams excluded"' \
           '"+ conv_y; // tax-free streams excluded"'
mkpatch c7 '"taxGainPool = Math.max(0, taxGainPool - _saleFromGain);"' '""'
mkpatch c8 '"const capGains_y = Math.round(_gainByYr[yr] || 0);"' \
           '"const capGains_y = 0;"'
mkpatch c9 '"const magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y + capGain_y;"' \
           '"const magi = ssTaxable + pen_y + work_y + rmdTax_y + conv_y + div_y;"'
mkpatch c12 '"const ssTaxable = taxableSSPortion(ssTotal, ordinaryIncome + qdcg_y);"' \
            '"const ssTaxable = taxableSSPortion(ssTotal, ordinaryIncome + div_y);"'

rebuild; BASE=$(measure)
if [ -z "$BASE" ]; then echo "BASELINE PROBE DIED:"; head -3 /tmp/ctl.probe.err; exit 1; fi
echo "BASELINE fingerprint: $BASE"
echo

run_control () {  # $1 name, $2 patch id, $3.. suites expected to fire
  local name="$1"; shift
  local patch="$PDIR/$1.py"; shift
  cp /tmp/ctl.orig.jsx $SRC
  if ! python3 "$patch"; then echo "  [$name] PATCH FAILED TO APPLY — anchor moved"; cp /tmp/ctl.orig.jsx $SRC; rebuild; return; fi
  rebuild
  local FP; FP=$(measure)
  echo "── CONTROL: $name"
  local fired=""
  for t in "$@"; do
    # MUST run from inside qa/ — these suites resolve paths relative to the cwd and die
    # otherwise, printing no "N failed" line at all. Exit status is checked (§B2).
    local res rc
    res=$( cd qa && timeout 900 node "$t.mjs" 2>&1 ); rc=$?
    local n; n=$(echo "$res" | grep -oE '[0-9]+ failed' | tail -1 | grep -oE '^[0-9]+')
    if [ -z "$n" ]; then fired="$fired $t(DIED rc=$rc)"
    elif [ "$n" -gt 0 ]; then fired="$fired $t($n)"; fi
  done
  if [ -z "$FP" ]; then
    echo "   patch effect : PROBE DIED — $(head -1 /tmp/ctl.probe.err) <-- a dead probe is NOT a no-op verdict"
  elif [ "$FP" = "$BASE" ]; then
    if [ -n "$fired" ]; then
      echo "   patch effect : not visible to the probe (fingerprint unchanged) — the suites are the coverage instrument here (STATUS v5.36 §7)"
    else
      echo "   patch effect : NO-OP AND UNCAUGHT ($FP) <-- either the patch is a no-op or the suite is blind; find out WHICH before proceeding"
    fi
  else
    echo "   patch effect : MOVED  $FP"
  fi
  if [ -n "$fired" ]; then echo "   suite verdict: CAUGHT by$fired"
  else echo "   suite verdict: *** NOT CAUGHT *** — that is the finding (§B2)"; fi
  echo
  cp /tmp/ctl.orig.jsx $SRC; rebuild
}

run_control "C1 gain target -> drawFromTaxable (the v5.34 defect)" c1 t19_engineD_exact t20_other_taxtype
run_control "C2 §2 share removed (pool = whole _taxInit)"          c2 t19_engineD_exact t20_other_taxtype
run_control "C3 _ordFrac back to the pre-sleeve pool"              c3 t19_engineD_exact t20_other_taxtype
run_control "C4 rmdToTaxable enters WITHOUT basis"                 c4 t19_engineD_exact t20_other_taxtype
run_control "C5 sub-pool stops growing (§5a amendment reverted)"   c5 t19_engineD_exact t20_other_taxtype
run_control "C6 capGain_y dropped from Engine D MAGI"              c6 t19_engineD_exact t20_other_taxtype
run_control "C7 sale never depletes the sub-pool"                  c7 t19_engineD_exact t20_other_taxtype
run_control "C8 Engine B wiring reverted (capGains_y = 0 again)"   c8 t17_engineC_exact t18_engineB_exact t19_engineD_exact
run_control "C9 Engine C MAGI term dropped"                        c9 t17_engineC_exact t18_engineB_exact t19_engineD_exact
run_control "C12 provisional income stops seeing gains (E-16 reverted)" c12 t18_engineB_exact

cp /tmp/ctl.orig.jsx $SRC; rebuild
echo "source restored: $(md5sum $SRC | cut -d' ' -f1)"
