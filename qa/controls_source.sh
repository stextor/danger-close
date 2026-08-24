#!/bin/bash
# NEGATIVE CONTROLS, SOURCE-LEVEL (OPERATIONS §B2) — SELF-CONTAINED.
#
# This is the half of §B2 that answers "would the suite have caught this?" — it reverts a fix in
# the source, rebuilds, confirms the perturbation actually moved engine output, and requires the
# named suites to FAIL. `qa/tools/package_check_controls.sh` verifies DELIVERY; this verifies that
# the suite can see defects at all. There is no other source-level harness in the repo.
#
# ── RENAMED AND REPAIRED 2026-08-23 (was controls_v542.sh). Read §B2 before changing it. ──
#
# D-2: the version is out of the FILENAME. It never described the controls — it described `SRC=`,
# which is one line. Naming the file after a build tag guarantees it LOOKS stale the moment the tag
# rolls, whether or not it is, and that is most of why this file sat unrun for five releases.
# Re-pointing is now: change SRC, the two `v547` build tags, and the three suite `:tag` suffixes.
#
# WHAT WAS ACTUALLY WRONG, and it was not staleness. All nineteen patch anchors were still intact
# at v5.47 — zero had moved. The defect was that `rebuild()` built only `qa/app_<tag>.mjs` while
# `t24_ss86_phasein` reads `dom_<tag>.cjs`, so four controls reported *** NOT CAUGHT *** about a
# suite the perturbation had never reached. See the long note at rebuild().
#
# Two additions make that class of failure impossible rather than merely fixed:
#   · verify_artifacts() — every artifact a named suite consumes must be NEWER than the source it
#     was built from, or the harness refuses to print a verdict at all.
#   · C0 — a control that MUST NOT fire, so a harness that rubber-stamped CAUGHT would be caught.
#
# Each control reverts one part of the v5.36 capital-gains work or the v5.42 §86 phase-in,
# rebuilds, MEASURES that engine output actually moved (a no-op patch proves nothing), then runs
# the engine suites and reports CAUGHT / NOT CAUGHT / DIED — exit status is checked because a dead
# suite prints no "N failed" line at all (§B2, learned twice).
#
# ⚠ COVERAGE GAP, larger than anything this file fixes: the controls cover v5.36 and v5.42. NOTHING
# here covers v5.43-v5.47 — not the §86 half-cap, the spouse-B claim gate, the HSA dividend base or
# the Roth tab's RMD-exempt share. t25, t26, t27 and t28 did not exist when these were written and
# have no controls at all. A green run of this file says the v5.36 and v5.42 work is still covered;
# it says nothing whatever about the last five releases.
#
# v5.42 edition history follows.
# v5.38: re-pointed to the v542 source; C14 and C15 added (the ACA-premium-sale gain tax
# and its IRMAA-lookback term, each reverted — t22 group I's pins must fire: C14 -> the
# totTax/estate pins; C15 -> the IRMAA pin at $0 as its unique signature, with ~$52 coupled
# knock-ons on the tax pins via the surcharge's own funding). Suites may carry a :arg
# suffix (e.g. t22_aca_floor:v547) passed through to the suite.
# v5.37: re-pointed to the v537 source; C13 added (the ordinary-growth line reverted —
# t20's $724,266 pin and E-15 extinction, and t19's $3,162,820 MAGI pin, must all fire).
# Adopted-for-repo form: the patch payloads are embedded below rather than read from /tmp,
# so the file cannot lose its patches between sessions (which is exactly what happened to
# the session-1 copy). Each control reverts one part of the v5.36 capital-gains work,
# rebuilds, MEASURES that engine output actually moved (a no-op patch proves nothing),
# then runs the engine suites and reports CAUGHT / NOT CAUGHT / DIED — exit status is
# checked because a dead suite prints no "N failed" line at all (§B2, learned twice).
set -u
cd "$(dirname "$0")/.."
SRC=v547.jsx
cp $SRC /tmp/ctl.orig.jsx
PDIR=$(mktemp -d)

# ── fingerprint: Engine D (gain/magi/end-wealth) AND Engines B (totAll) / C (totalIrmaa),
#    the latter two fed a gainByYr built from D's schedule exactly as the app's call sites
#    do — so reverting B's wiring or C's MAGI term visibly MOVES the fingerprint.
measure () {
  node --input-type=module -e '
    const m = await import("./qa/app_v547.mjs"); const g = m.__g;
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

# ── rebuild: produce EVERY artifact a named suite consumes, then PROVE the patch reached it.
#
# Until 2026-08-23 this built only `qa/app_<tag>.mjs`. But `t24_ss86_phasein` — the sole suite
# here that reads the rendered DOM — does `require("./dom_<tag>.cjs")`, and that bundle was never
# rebuilt. So C16-C19 patched the source, rebuilt the module, and left t24 reading a CLEAN build.
# All four reported *** NOT CAUGHT ***, which under §B2 reads as "t24 is blind to the §86 phase-in
# it was built to guard." It is not. Hand-verified at v5.47, each perturbation applied with the
# bundle rebuilt alongside: C16 -> 6 t24 failures, C17 -> 8, C18 -> 8, C19 -> 7, clean -> 0.
# t24 discriminates on every one. The harness simply never delivered the perturbation.
#
# A false NOT CAUGHT is the worst output this file can produce. §B2 says a control that does not
# fire IS the finding — so a reader following the rule correctly goes hunting for a hole that does
# not exist, and every honest conclusion available to them is wrong.
#
# D-1, decided 2026-08-23: the bundle is rebuilt ALWAYS, not only when a control names a
# DOM-consuming suite. The bundle costs ~4.5s against the module's ~0.7s, so always adds roughly
# 2.9 minutes across 19 controls. That is the right trade: the defect being fixed WAS a build step
# that was conditional in effect, and a lookup from suite name to "needs DOM" is a second place the
# truth lives, where drift is silent and produces exactly this failure again.
rebuild () {
  cp $SRC DangerClose.jsx
  bash ./qa/mk_testable.sh v547 >/dev/null 2>&1 || { echo "REBUILD FAILED — controls are blind without it; aborting (found the hard way at v5.38: a stripped execute bit made every control read NOT CAUGHT)" >&2; exit 1; }
  npx esbuild qa/dom_entry_v547.jsx --bundle --format=cjs --platform=browser --loader:.jsx=jsx \
    --jsx=automatic --outfile=qa/dom_v547.cjs --log-level=error >/dev/null 2>&1 || { echo "DOM BUNDLE REBUILD FAILED — t24 would silently read a stale build; aborting" >&2; exit 1; }
  cp qa/app_v547.mjs qa/app_testable.mjs 2>/dev/null || true
  verify_artifacts
}

# ── the class-level fix. Rebuilding the bundle repairs THIS instance; this makes the class
# impossible. Every artifact a named suite consumes must be NEWER than the source it was built
# from. If one is stale the suites are reporting on code that is not under test, and the only
# safe verdict is to stop — a harness that cannot prove the perturbation arrived must not print
# CAUGHT or NOT CAUGHT, because both are claims it has not earned.
verify_artifacts () {
  local stale=""
  for art in qa/app_v547.mjs qa/dom_v547.cjs; do
    [ -f "$art" ] || { stale="$stale $art(missing)"; continue; }
    [ "$art" -nt "$SRC" ] || stale="$stale $art(older than $SRC)"
  done
  if [ -n "$stale" ]; then
    echo "ARTIFACT STALE —$stale" >&2
    echo "  The suites would report on code that is NOT under test. Refusing to print a verdict." >&2
    exit 1
  fi
}

# ── embedded patches: each asserts its anchor appears EXACTLY ONCE before replacing ──
mkpatch () { cat > "$PDIR/$1.py" << PYEOF
import sys
src = open("v547.jsx").read()
OLD = $2
NEW = $3
n = src.count(OLD)
if n != 1:
    print(f"anchor count {n} != 1", file=sys.stderr); sys.exit(1)
open("v547.jsx","w").write(src.replace(OLD, NEW))
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
mkpatch c13 '"taxOrd = Math.min(taxable - taxGainPool, taxOrd * (1 + growth.tax));"' \
            '""'
mkpatch c14 '"totTax += _acaGainTax; if (widowed) widowTax += _acaGainTax;"' \
            '""'
mkpatch c15 '"magiHist[yr] = magi + saleGain + acaSaleGain;               // decision 1: the lookback sees this gain"' \
            '""'

# ── v5.42 §86 upper-tier controls. Each perturbs ONE element of the phase-in the release
#    added; t24 must fire for every one. If a control does not fire, THAT IS THE FINDING
#    (OPERATIONS §B2) — investigate what t24 is blind to; do not adjust the control.
mkpatch c16 '"const _ssPhaseIn = (provisional - _ssT2) * 0.85 + Math.min(_ssPara1, (_ssT2 - _ssT1) * 0.5);"' \
            '"const _ssPhaseIn = (provisional - _ssT2) * 0.50 + Math.min(_ssPara1, (_ssT2 - _ssT1) * 0.5);"'
mkpatch c17 '"const _ssPhaseIn = (provisional - _ssT2) * 0.85 + Math.min(_ssPara1, (_ssT2 - _ssT1) * 0.5);"' \
            '"const _ssPhaseIn = (provisional - _ssT2) * 0.85;"'
mkpatch c18 '"taxableSS = Math.round(Math.min(_ssPhaseIn, totalSS * 0.85));"' \
            '"taxableSS = Math.round(_ssPhaseIn);"'
mkpatch c19 '"const _ssT2 = taxFactsFor(_filingSingleAt(year)).ssThr2;"' \
            '"const _ssT2 = taxFactsFor(_filingSingleAt(year)).ssThr2 + 10000;"'
mkpatch c20 '"const _ssT1 = taxFactsFor(_filingSingleAt(year)).ssThr1;"' \
            '"const _ssT1 = 32000;"'
mkpatch c21 '"const _ssPara1 = Math.min(totalSS * 0.5, (provisional - _ssT1) * 0.5);"' \
            '"const _ssPara1 = Math.min(totalSS * 0.85, (provisional - _ssT1) * 0.5);"'

# ── C0 · THE CONTROL THAT MUST NOT FIRE ──────────────────────────────────────────────────
# Every other control here is expected to fire, which means a broken harness that printed CAUGHT
# unconditionally would pass all nineteen of them. Nothing in this file could tell the difference
# between "the suites are discriminating" and "the verdict is a rubber stamp." C0 closes that: a
# comment-only edit, byte-different source, identical behaviour. The fingerprint must NOT move and
# NO suite may fire. If C0 fires, the suites are keying on something they should not be — source
# text, file size, a timestamp — and every CAUGHT above it is suspect.
# (The same gap, one level over, is why package_check_controls.sh gained P19 on 2026-08-23.)
mkpatch c0 '"// tax-free streams excluded"' \
           '"// tax-free streams excluded (C0 no-op marker: comment text only, zero behaviour)"'

run_noop_control () {  # $1 name, $2 patch id, $3.. suites that must ALL stay green
  local name="$1"; shift
  local patch="$PDIR/$1.py"; shift
  cp /tmp/ctl.orig.jsx $SRC
  if ! python3 "$patch"; then echo "  [$name] PATCH FAILED TO APPLY — anchor moved"; cp /tmp/ctl.orig.jsx $SRC; rebuild; return; fi
  rebuild
  local FP; FP=$(measure)
  echo "── NO-OP CONTROL: $name"
  local fired=""
  for t in "$@"; do
    local res rc tf targ
    tf="${t%%:*}"; targ="${t#*:}"; [ "$targ" = "$t" ] && targ=""
    res=$( cd qa && timeout 900 node "$tf.mjs" $targ 2>&1 ); rc=$?
    local n; n=$(echo "$res" | grep -oE '[0-9]+ failed' | tail -1 | grep -oE '^[0-9]+')
    if [ -z "$n" ]; then fired="$fired $t(DIED rc=$rc)"
    elif [ "$n" -gt 0 ]; then fired="$fired $t($n)"; fi
  done
  if [ "$FP" != "$BASE" ]; then
    echo "   *** THE NO-OP MOVED THE FINGERPRINT *** $FP <-- a comment changed behaviour, or the probe is unstable"
  else
    echo "   patch effect : none, as intended (fingerprint identical)"
  fi
  if [ -n "$fired" ]; then
    echo "   suite verdict: *** FIRED ON A NO-OP *** by$fired <-- the suites are keying on something that is not behaviour; every CAUGHT below is suspect"
  else
    echo "   suite verdict: correctly SILENT — the harness can tell the difference"
  fi
  echo
  cp /tmp/ctl.orig.jsx $SRC; rebuild
}

# ══ v5.43-v5.47 · fourteen controls added 2026-08-23 ══════════════════════════════════════
# Until now this file covered the v5.36 capital-gains work and the v5.42 §86 phase-in ONLY.
# t25, t26, t27 and t28 did not exist when it was written and had NO source-level control at all
# — five releases whose suite coverage was assumed rather than demonstrated, which is the exact
# position §B2 was written in response to.
#
# All fourteen anchors were verified to resolve EXACTLY ONCE against v5.47 before any was written.
# Seven of them patch component-inline code reachable only through the DOM bundle, so every one
# of those would have reported a false NOT CAUGHT before the rebuild fix landed on 2026-08-23.
mkpatch d1  '"(_prov86 - _ssF.ssThr2) * 0.85 + Math.min(_para1, (_ssF.ssThr2 - _ssF.ssThr1) * 0.5));"' \
            '"(_prov86 - _ssF.ssThr2) * 0.50 + Math.min(_para1, (_ssF.ssThr2 - _ssF.ssThr1) * 0.5));"'
mkpatch d2  '": _prov86 <= _ssF.ssThr2 ? Math.min(_para1, ssTot * 0.85)"' \
            '": _prov86 <= _ssF.ssThr2 ? Math.min(_para1 * 2, ssTot * 0.85)"'
mkpatch d3  '"const _para1 = Math.min(ssTot * 0.5, Math.max(0, _prov86 - _ssF.ssThr1) * 0.5);"' \
            '"const _para1 = Math.max(0, _prov86 - _ssF.ssThr1) * 0.5;"'
mkpatch d4  '"const _ssPara1 = Math.min(totalSS * 0.5, (provisional - _ssT1) * 0.5);"' \
            '"const _ssPara1 = (provisional - _ssT1) * 0.5;"'
mkpatch d5  '"Math.min(ssTot * 0.85,\n          (_prov86 - _ssF.ssThr2) * 0.85"' \
            '"Math.min(ssTot * 1.00,\n          (_prov86 - _ssF.ssThr2) * 0.85"'
mkpatch d6  '"const spouseBSS = _singleRoth ? 0 : year > _ssBYearRoth ? _rsSsB * 12 : year === _ssBYearRoth ? _rsSsB * _ssBPartialMonths : 0;"' \
            '"const spouseBSS = _singleRoth ? 0 : _rsSsB * 12;"'
mkpatch d7  '"const _ssBYearRoth = _tlRoth.ssB_date.year;"' \
            '"const _ssBYearRoth = _tlRoth.ssB_date.year - 5;"'
mkpatch d8  '"const div_y = Math.round(Math.max(0, taxBal - (P.othHsa || 0)) * (P.taxYieldPct / 100));"' \
            '"const div_y = Math.round(Math.max(0, taxBal) * (P.taxYieldPct / 100));"'
mkpatch d9  '"Math.max(0, _taxableInitI - (_rsbC.othHsa || 0))"' \
            '"Math.max(0, _taxableInitI)"'
mkpatch d10 '"Math.max(0, _taxableInit - (_rsbB.othHsa || 0))"' \
            '"Math.max(0, _taxableInit)"'
mkpatch d11 '"const annSh = { A: _rsbC.annShareA || 0, B: _rsbC.annShareB || 0 };"' \
            '"const annSh = { A: 0, B: 0 };"'
mkpatch d12 '"noConv: Math.round(P0.t0 * Math.pow(1 + tradGrowth, P0.yrs) * (1 - P0.annSh) / rmdDivisor(P0.age)),"' \
            '"noConv: Math.round(P0.t0 * Math.pow(1 + tradGrowth, P0.yrs) / rmdDivisor(P0.age)),"'
mkpatch d13 '"withConv: Math.round(balAt(P0.who, P0.yr) * (1 - P0.annSh) / rmdDivisor(P0.age)),"' \
            '"withConv: Math.round(balAt(P0.who, P0.yr) / rmdDivisor(P0.age)),"'
mkpatch d14 '"const yrs = Math.max(0, yr - tl.rothLadderStart);"' \
            '"const yrs = Math.max(0, yr - tl.asOfYear);"'

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
    local tf="${t%%:*}" targ="${t#*:}"; [ "$targ" = "$t" ] && targ=""
    res=$( cd qa && timeout 900 node "$tf.mjs" $targ 2>&1 ); rc=$?
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

run_noop_control "C0 comment-only edit — MUST NOT FIRE" c0 t17_engineC_exact t18_engineB_exact t19_engineD_exact t20_other_taxtype t24_ss86_phasein:v547

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
run_control "C13 ordinary sub-pool stops growing (v5.37 reverted, E-15 back)" c13 t19_engineD_exact t20_other_taxtype
run_control "C14 ACA-sale gain tax reverted (the v5.38 asymmetry back)" c14 t22_aca_floor:v547
run_control "C15 IRMAA-lookback term dropped (decision 1 reverted)"     c15 t22_aca_floor:v547


echo "== v5.42 §86 upper-tier controls =="
run_control "C16 phase-in SLOPE 0.85 -> 0.50"                        c16 t24_ss86_phasein:v547
run_control "C17 the (adjbase-base)/2 term dropped from the phase-in" c17 t24_ss86_phasein:v547
run_control "C18 the overall 85%-of-benefits cap removed"             c18 t24_ss86_phasein:v547
run_control "C19 adjusted base amount shifted +10,000"                c19 t24_ss86_phasein:v547
run_control "C20 base amount hardcoded to the MARRIED literal (v5.15 reverted)" c20 t1_units:v547
run_control "C21 para1 capped at 85% of benefits, not 1/2 (the middle tier's defect, moved up)" c21 t24_ss86_phasein:v547 t1_units:v547

cp /tmp/ctl.orig.jsx $SRC; rebuild
# ── v5.43-v5.47 controls. Each names the suite that OWNS the behaviour plus a neighbour, so a
# control that fires only on its owner still shows whether the blast radius is what it should be.
# ⚠ Controls naming t2 must use the COMPARE mode — `t2_engines v547` only WRITES a fingerprint;
# the guardrail lives in `t2_engines compare v546 v547`, and naming the wrong one silently
# under-reports exactly the parity check v5.47 was added to strengthen.
run_control "D1 v5.43 Engine C \u00a786 phase-in slope 0.85 -> 0.50" d1 t25_engineC_ss86:v547 t17_engineC_exact
run_control "D2 v5.43 Engine C \u00a786 middle tier doubled" d2 t25_engineC_ss86:v547 t17_engineC_exact
run_control "D3 v5.45 half-cap removed from ENGINE C" d3 t25_engineC_ss86:v547 t27_half_cap:v547
# ── D4 is DELIBERATELY NOT RUN, and this is the finding, not an omission ──────────────────
# The patch is written and its anchor resolves exactly once. It reverts the v5.45 half-benefits
# cap in the ROTH TAB's own copy of §86 (`_ssPara1`, L8946) — the mirror of the Engine C copy D3
# reverts. Measured 2026-08-23: it moves nothing and nothing fires, because the cap binds only
# where provisional income exceeds the first threshold by MORE than total benefits, and the
# shipped household carries $55,200 of benefits. Same shape as D3 before t25 gained §F.
#
# It is not run because a control that CANNOT fire would print *** NOT CAUGHT *** on every run
# forever — and §B2 says a control that does not fire is a finding to investigate. A permanent
# false finding trains the reader to ignore the one real one. So the patch stays, the invocation
# does not, and the reason is here rather than in a verdict.
#
# TO ENABLE IT: t24 needs a low-benefits fixture, the way t25 gained §F for the Engine C copy.
# That is heavier than t25's was — t24 is DOM-driven and reimplements the ladder recursion
# against EXAMPLE-HOUSEHOLD CONSTANTS (`retireStartBalances(2029).tradInitA/B`, `getPension()*12`,
# the spouse-B work taper), so a second household means re-deriving all of them. Scoped, not done.
# run_control "D4 v5.45 half-cap removed from the ROTH TAB" d4 t24_ss86_phasein:v547 t27_half_cap:v547
run_control "D5 v5.43 Engine C overall 85% cap loosened" d5 t25_engineC_ss86:v547 t17_engineC_exact
run_control "D6 v5.46 spouse-B claim gate reverted" d6 t28_ssB_claim_gate:v547 t24_ss86_phasein:v547
run_control "D7 v5.46 B claim year shifted 5 years early" d7 t28_ssB_claim_gate:v547 t23_roth_ladder_rmd:v547
run_control "D8 v5.47 HSA back into ENGINE A dividend base" d8 t1_units:v547 t25_engineC_ss86:v547
run_control "D9 v5.47 HSA back into ENGINE C dividend base" d9 t25_engineC_ss86:v547 t1_units:v547
run_control "D10 v5.47 HSA back into ENGINE B dividend base" d10 t1_units:v547 t18_engineB_exact
run_control "D11 v5.47 Roth tab annuity share zeroed" d11 t26_noconv_span:v547 t1_units:v547
run_control "D12 v5.47 no-conversion card unscaled" d12 t26_noconv_span:v547 t1_units:v547
run_control "D13 v5.47 with-conversion card unscaled" d13 t26_noconv_span:v547 t23_roth_ladder_rmd:v547
run_control "D14 v5.44 span seeded from the as-of year again" d14 t26_noconv_span:v547 t23_roth_ladder_rmd:v547

echo "source restored: $(md5sum $SRC | cut -d' ' -f1)"
