"""Builds the scope's two Engine B test patches from a run folder's v574.jsx (SCOPE_SURVIVOR_AGE_AND_GAINS_DEDUCTION §1).
Run from the ROOT of a v574 run folder, then: ./qa/mk_testable.sh scp1 && ./qa/mk_testable.sh scp2
  scp1 = regular path fixed only (shows the phantom AMT);  scp2 = regular AND AMT paths fixed (matches the law)."""
import io
src = io.open("v574.jsx", encoding="utf-8").read()
H = ("    let stack = ordinaryTaxable; // gains stack on top of ordinary income\n    let remaining = capGains;",
     "    let stack = Math.max(0, ordinaryTaxable); // PROBE\n    let remaining = Math.max(0, capGains + Math.min(0, ordinaryTaxable));")
R = ("const capGainsTax = ltcgTax(qdcg_y, taxableOrdinary, yr);", "const capGainsTax = ltcgTax(qdcg_y, grossOrdinary - totalDeductions, yr);")
A = ("+ ltcgTax(qdcg_y, amtBase, yr);", "+ ltcgTax(qdcg_y, amti - amtExempt, yr);")
for a, _ in (H, R, A): assert src.count(a) == 1, "anchor not unique: " + a[:40]
p1 = src.replace(*H).replace(*R); io.open("scp1.jsx", "w", encoding="utf-8").write(p1)
io.open("scp2.jsx", "w", encoding="utf-8").write(p1.replace(*A)); print("wrote scp1.jsx, scp2.jsx")
