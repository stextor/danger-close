// SESSION-ONLY (Phase 2, item 7): stateTaxAnnual's conditioned branches against their DECLARED rules, by hand. Asserts nothing.
const g = (await import("../../app_v573.mjs")).__g; const S = g.stateTaxAnnual;
const cases = [
  // [label, args, hand]
  ["NM joint 67/67, AGI 42,000 (band ≤42,000 → 4,000 each): .049 × (42,000 − 8,000)", { code: "NM", retIncome: 42000, ageA: 67, ageB: 67 }, 0.049 * 34000],
  ["NM joint AGI 42,001 (next band, 3,000 each): .049 × (42,001 − 6,000)", { code: "NM", retIncome: 42001, ageA: 67, ageB: 67 }, 0.049 * 36001],
  ["NM joint 67/63 AGI 30,000 (one qualifier, 8,000): .049 × 22,000", { code: "NM", retIncome: 30000, ageA: 67, ageB: 63 }, 0.049 * 22000],
  ["NM single 67 AGI 18,000 (8,000): .049 × 10,000", { code: "NM", retIncome: 18000, ageA: 67, single: true }, 490],
  ["NM single 67 AGI 18,001 (7,000): .049 × 11,001", { code: "NM", retIncome: 18001, ageA: 67, single: true }, 0.049 * 11001],
  ["NM single 67 AGI 28,501 (0): .049 × 28,501", { code: "NM", retIncome: 28501, ageA: 67, single: true }, 0.049 * 28501],
  ["CT joint age 40/40, AGI 104,999 (<105,000 → 85% of 104,999 excluded): .05 × 15,749.85", { code: "CT", retIncome: 104999, ageA: 40, ageB: 40 }, 0.05 * 104999 * 0.15],
  ["CT joint AGI 105,000 (EXCLUSIVE top → 70%): .05 × 31,500", { code: "CT", retIncome: 105000, ageA: 40, ageB: 40 }, 0.05 * 31500],
  ["CT single AGI 74,999 (<75,000 → 100%): 0", { code: "CT", retIncome: 74999, ageA: 70, single: true }, 0],
  ["CT single AGI 100,000 (last band exclusive → 0%): .05 × 100,000", { code: "CT", retIncome: 100000, ageA: 70, single: true }, 5000],
  ["VA joint 67/67 AGIexSS 80,000: excl max(0, 24,000 − 5,000) = 19,000 → .0575 × 61,000", { code: "VA", retIncome: 80000, ageA: 67, ageB: 67 }, 0.0575 * 61000],
  ["VA joint 67/67 AGIexSS 99,000: excl 0 → .0575 × 99,000", { code: "VA", retIncome: 99000, ageA: 67, ageB: 67 }, 0.0575 * 99000],
  ["VA single 67 AGIexSS 55,000: excl 7,000 → .0575 × 48,000", { code: "VA", retIncome: 55000, ageA: 67, single: true }, 0.0575 * 48000],
  ["VA joint 67/67 with SS: AGIexSS excludes the 30,000 of taxable SS (base agiExSS): 80,000 ret → excl 19,000", { code: "VA", retIncome: 80000, ssTaxableFed: 30000, ageA: 67, ageB: 67 }, 0.0575 * 61000],
];
let bad = 0;
for (const [l, a, want] of cases) { const got = S(a); const ok = Math.abs(got - want) < 0.005; if (!ok) bad++; console.log(`${ok ? "✓" : "✗"} ${l}: engine ${got.toFixed(4)} hand ${want.toFixed(4)}`); }
console.log(`${bad} failing of ${cases.length}`);
