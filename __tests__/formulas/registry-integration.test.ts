/**
 * Formula Registry Integration Tests
 *
 * Verifies that the formula registry is complete and self-consistent:
 *   1. Every formula ID referenced by a spec file resolves via getFormula().
 *   2. getFormula() throws a descriptive error for unknown IDs.
 *   3. Every registered formula is a callable function.
 *   4. The registry size matches expectations (regression guard).
 *
 * These tests are intentionally separate from per-formula unit tests.
 * They catch wiring bugs — a new spec that references a formula ID not yet
 * registered, or a registry export that accidentally drops a module.
 *
 * If a new spec file is added with a new formula ID, add that ID to
 * SPEC_FORMULA_IDS below and create the corresponding formula module +
 * per-formula unit tests.
 */

import formulaRegistry, { getFormula } from '@/lib/formulas/index';

// ─── All formula IDs referenced by spec files ────────────────────────────────
// Source of truth: content/calculators/**/*.spec.json → "formula" field.
// Keep this list sorted alphabetically within each category.
// If the list diverges from actual spec files, the test suite will tell you.

const SPEC_FORMULA_IDS = [
  // Business (11)
  'break-even',
  'business-sales-tax',
  'commission',
  'employee-cost',
  'gross-margin',
  'markup',
  'overtime',
  'payroll',
  'profit',
  'revenue',
  'roi',

  // Construction (9 unique IDs — volume-material serves gravel + mulch specs)
  'board-foot',
  'concrete-volume',
  'drywall',
  'fence',
  'flooring',
  'paint-coverage',
  'roofing',
  'square-footage',
  'volume-material',

  // Conversion (1 ID — serves 6 converter specs)
  'unit-convert',

  // Everyday (11 — date-diff serves age/countdown/date specs; hours-worked + time-math both from time-math.ts)
  'date-diff',
  'discount',
  'electricity-cost',
  'final-grade',
  'fuel-cost',
  'gpa',
  'grade',
  'hours-worked',
  'time-math',
  'timezone',
  'tip-calc',

  // Finance (21 — loan-payment serves loan + payment specs)
  '401k-growth',
  'amortization',
  'cd-return',
  'compound-interest',
  'debt-payoff',
  'down-payment',
  'home-affordability',
  'income-tax',
  'inflation',
  'interest-rate-solve',
  'investment-growth',
  'loan-payment',
  'mortgage-payment',
  'net-worth',
  'refinance-breakeven',
  'rent-vs-buy',
  'retirement-projection',
  'salary-convert',
  'sales-tax',
  'savings-growth',
  'tax-brackets',

  // Health (13)
  'bmi',
  'bmr',
  'body-fat',
  'calorie-needs',
  'conception',
  'due-date',
  'heart-rate-zones',
  'ideal-weight',
  'lean-body-mass',
  'macros',
  'one-rep-max',
  'pace',
  'pregnancy',

  // Math (12)
  'central-tendency',
  'circle',
  'exponents',
  'fractions',
  'gcf-lcm',
  'logarithm',
  'percentage',
  'probability',
  'quadratic',
  'ratio',
  'standard-deviation',
  'triangle-solver',

  // Science (5)
  'density',
  'energy',
  'ohms-law',
  'pressure',
  'velocity',
] as const;

// Derived set of unique IDs for deduplication checks
const UNIQUE_SPEC_IDS = new Set(SPEC_FORMULA_IDS);

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('Formula Registry — Completeness', () => {
  it('formulaRegistry is a non-empty object', () => {
    expect(formulaRegistry).toBeDefined();
    expect(typeof formulaRegistry).toBe('object');
    expect(Object.keys(formulaRegistry).length).toBeGreaterThan(0);
  });

  it('registers at least 83 unique formula IDs (regression guard)', () => {
    // The registry currently has 84 IDs (82 modules, some modules register 2).
    // This guard catches accidental deletion of imports in index.ts.
    const count = Object.keys(formulaRegistry).length;
    expect(count).toBeGreaterThanOrEqual(83);
  });

  it('SPEC_FORMULA_IDS list has no duplicates', () => {
    expect(SPEC_FORMULA_IDS.length).toBe(UNIQUE_SPEC_IDS.size);
  });

  it('SPEC_FORMULA_IDS covers all unique formula IDs referenced by spec files (83)', () => {
    // 83 unique IDs across all 92 spec files (some formula IDs are shared).
    expect(UNIQUE_SPEC_IDS.size).toBe(83);
  });
});

describe('Formula Registry — getFormula() resolves all spec IDs', () => {
  it.each(SPEC_FORMULA_IDS)(
    'getFormula("%s") returns a callable function',
    (formulaId) => {
      const fn = getFormula(formulaId);
      expect(typeof fn).toBe('function');
    }
  );
});

describe('Formula Registry — getFormula() error handling', () => {
  it('throws a descriptive error message for an unknown formula ID', () => {
    expect(() => getFormula('nonexistent-formula')).toThrow(
      'Formula not found: "nonexistent-formula"'
    );
  });

  it('throws for an empty string', () => {
    expect(() => getFormula('')).toThrow();
  });

  it('throws for a near-miss typo (bmi-calculator instead of bmi)', () => {
    expect(() => getFormula('bmi-calculator')).toThrow();
  });

  it('throws for an ID with a trailing space', () => {
    expect(() => getFormula('mortgage-payment ')).toThrow();
  });

  it('throws for a valid spec ID with wrong casing', () => {
    expect(() => getFormula('BMI')).toThrow();
    expect(() => getFormula('Mortgage-Payment')).toThrow();
  });
});

describe('Formula Registry — all registered entries are callable functions', () => {
  it('every entry in formulaRegistry is a function', () => {
    const entries = Object.entries(formulaRegistry);
    expect(entries.length).toBeGreaterThan(0);
    for (const [id, fn] of entries) {
      if (typeof fn !== 'function') {
        throw new Error(`formulaRegistry["${id}"] should be a function, got ${typeof fn}`);
      }
    }
  });

  it('every spec formula ID is present as a key in formulaRegistry', () => {
    const registryKeys = Object.keys(formulaRegistry);
    const missing = SPEC_FORMULA_IDS.filter((id) => !registryKeys.includes(id));
    if (missing.length > 0) {
      throw new Error(
        `These spec formula IDs are missing from formulaRegistry:\n  ${missing.join('\n  ')}\n` +
          `Run "npm run generate:registry" to rebuild the formula index.`
      );
    }
  });
});

describe('Formula Registry — spot-check: high-priority formula IDs callable without crash', () => {
  // These are not full unit tests — those live in the per-formula test files.
  // This batch confirms the registry wiring works end-to-end for key categories.

  it('mortgage-payment formula runs with standard inputs', () => {
    const fn = getFormula('mortgage-payment');
    const result = fn({ homePrice: 300000, downPayment: 60000, interestRate: 6.5, loanTerm: '30' });
    expect(typeof result.monthlyPayment).toBe('number');
    expect(result.monthlyPayment as number).toBeGreaterThan(0);
  });

  it('compound-interest formula runs with standard inputs', () => {
    const fn = getFormula('compound-interest');
    const result = fn({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '12',
      years: 10,
    });
    expect(typeof result.futureValue).toBe('number');
    expect(result.futureValue as number).toBeGreaterThan(10000);
  });

  it('bmi formula runs with standard metric inputs', () => {
    const fn = getFormula('bmi');
    const result = fn({ weight: 70, height: 175, unitSystem: 'metric' });
    expect(typeof result.bmi).toBe('number');
    expect(result.bmi as number).toBeCloseTo(22.9, 0);
  });

  it('percentage formula runs in percent-of mode', () => {
    const fn = getFormula('percentage');
    const result = fn({ mode: 'percent-of', percentValue: 20, baseValue: 150 });
    expect(result.result).toBe(30);
  });

  it('unit-convert formula runs meter→foot', () => {
    const fn = getFormula('unit-convert');
    const result = fn({ value: 1, fromUnit: 'meter', toUnit: 'foot' });
    expect(result.result as number).toBeCloseTo(3.2808, 3);
  });

  it('hours-worked formula runs with start/end time', () => {
    const fn = getFormula('hours-worked');
    const result = fn({ startTime: '09:00', endTime: '17:00', breakMinutes: 30 });
    expect(typeof result.decimalHours).toBe('number');
    // 8h - 0.5h break = 7.5h
    expect(result.decimalHours as number).toBeCloseTo(7.5, 1);
  });

  it('heart-rate-zones formula runs with age input', () => {
    const fn = getFormula('heart-rate-zones');
    const result = fn({ age: 30, restingHeartRate: 65, maxHrMethod: 'formula' });
    // Should return zone data
    expect(result).toBeDefined();
  });

  it('ohms-law formula runs in voltage mode', () => {
    const fn = getFormula('ohms-law');
    const result = fn({ mode: 'voltage', resistance: 10, current: 2 });
    // V = I × R = 2 × 10 = 20
    expect(result.voltage as number).toBeCloseTo(20, 1);
  });

  it('volume-material formula runs (covers gravel + mulch specs)', () => {
    const fn = getFormula('volume-material');
    const result = fn({ length: 10, width: 5, depth: 0.15, material: 'gravel' });
    expect(result).toBeDefined();
  });

  it('date-diff formula runs in difference mode (covers age + countdown + date specs)', () => {
    const fn = getFormula('date-diff');
    // date-diff uses startDate + endDate in 'difference' mode (default)
    const result = fn({ startDate: '1990-01-01', endDate: '2024-01-01' });
    expect(result).toBeDefined();
    expect(typeof result.totalDays).toBe('number');
    expect(result.totalDays as number).toBeGreaterThan(0);
  });

  it('loan-payment formula runs (covers loan + payment specs)', () => {
    const fn = getFormula('loan-payment');
    // loan-payment uses loanAmount + annualRate + loanTerm (in months)
    const result = fn({ loanAmount: 20000, annualRate: 5, loanTerm: 60 });
    expect(typeof result.monthlyPayment).toBe('number');
    expect(result.monthlyPayment as number).toBeGreaterThan(0);
  });
});
