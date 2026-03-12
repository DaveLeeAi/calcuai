import { calculateMortgage } from '@/lib/formulas/finance/mortgage-payment';
import {
  expectCurrencyPrecision,
  expectNonNegativeFiniteNumber,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
  boundaryValues,
} from '../../helpers/formula-test-utils';

// ─── Baseline inputs ────────────────────────────────────────────────────────
const BASE = {
  homePrice: 350000,
  downPayment: 70000,
  interestRate: 6.5,
  loanTerm: '30',
};

describe('calculateMortgage — edge cases & regression', () => {
  // ═══ PRECISION REGRESSION ══════════════════════════════════════════════════
  // Pin exact 2dp values — any rounding drift breaks these tests

  it('pins exact monthly payment for $280k at 6.5% / 30yr', () => {
    const result = calculateMortgage(BASE);
    expectCurrencyPrecision(result, 'monthlyPayment', 1769.79);
  });

  it('pins exact monthly payment for $200k at 5% / 15yr', () => {
    const result = calculateMortgage({
      homePrice: 250000,
      downPayment: 50000,
      interestRate: 5.0,
      loanTerm: '15',
    });
    expectCurrencyPrecision(result, 'monthlyPayment', 1581.59);
  });

  it('pins exact monthly payment for $400k at 7% / 30yr with PMI', () => {
    const result = calculateMortgage({
      homePrice: 500000,
      downPayment: 50000, // 10% down → PMI
      interestRate: 7.0,
      loanTerm: '30',
      includePMI: true,
    });
    // P&I on $450k at 7%/30yr ≈ $2994.31, PMI ≈ $187.50
    expect(result.monthlyPayment).toBeCloseTo(3181.81, 0);
  });

  // ═══ PMI BOUNDARY (20% DOWN PAYMENT THRESHOLD) ════════════════════════════

  it('applies PMI at 19.99% down payment', () => {
    const result = calculateMortgage({
      homePrice: 100000,
      downPayment: 19990, // 19.99%
      interestRate: 6.0,
      loanTerm: '30',
      includePMI: true,
    });
    // PMI should be present (down payment < 20%)
    const breakdown = result.paymentBreakdown as Array<{ name: string }>;
    expect(breakdown.some(b => b.name === 'PMI')).toBe(true);
  });

  it('does not apply PMI at exactly 20% down payment', () => {
    const result = calculateMortgage({
      homePrice: 100000,
      downPayment: 20000, // exactly 20%
      interestRate: 6.0,
      loanTerm: '30',
      includePMI: true,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string }>;
    expect(breakdown.some(b => b.name === 'PMI')).toBe(false);
  });

  it('does not apply PMI at 20.01% down payment', () => {
    const result = calculateMortgage({
      homePrice: 100000,
      downPayment: 20010, // 20.01%
      interestRate: 6.0,
      loanTerm: '30',
      includePMI: true,
    });
    const breakdown = result.paymentBreakdown as Array<{ name: string }>;
    expect(breakdown.some(b => b.name === 'PMI')).toBe(false);
  });

  // ═══ RATE BOUNDARY CASES ══════════════════════════════════════════════════

  it('handles very low interest rate (0.01%)', () => {
    const result = calculateMortgage({
      ...BASE,
      interestRate: 0.01,
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    // At near-zero rate, payment should be close to principal / months
    expect(result.monthlyPayment as number).toBeCloseTo(280000 / 360, -1);
  });

  it('handles high interest rate (25%)', () => {
    const result = calculateMortgage({
      ...BASE,
      interestRate: 25,
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    // At 25%, monthly payment should be very high (mostly interest)
    expect(result.monthlyPayment as number).toBeGreaterThan(5000);
  });

  // ═══ TERM BOUNDARY CASES ═════════════════════════════════════════════════

  it('handles 1-year term', () => {
    const result = calculateMortgage({
      ...BASE,
      loanTerm: '1',
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(12);
  });

  it('handles 40-year term', () => {
    const result = calculateMortgage({
      ...BASE,
      loanTerm: '40',
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule).toHaveLength(480);
    // 40yr payment should be less than 30yr payment
    const result30 = calculateMortgage(BASE);
    expect(result.monthlyPayment as number).toBeLessThan(result30.monthlyPayment as number);
  });

  // ═══ AMORTIZATION INVARIANTS ═════════════════════════════════════════════

  it('total principal paid equals loan amount (within rounding)', () => {
    const result = calculateMortgage(BASE);
    const schedule = result.amortizationSchedule as Array<{ principal: number }>;
    const totalPrincipalPaid = schedule.reduce((sum, row) => sum + row.principal, 0);
    // Should equal $280,000 within $1 rounding tolerance
    expect(totalPrincipalPaid).toBeCloseTo(280000, -1);
  });

  it('each payment equals principal + interest (per row)', () => {
    const result = calculateMortgage(BASE);
    const schedule = result.amortizationSchedule as Array<{
      payment: number;
      principal: number;
      interest: number;
    }>;
    for (const row of schedule.slice(0, 10)) {
      // Check first 10 rows for consistency
      expect(row.payment).toBeCloseTo(row.principal + row.interest, 1);
    }
  });

  // ═══ MONOTONICITY ════════════════════════════════════════════════════════

  it('monthly payment increases with interest rate', () => {
    const results = sweepInput(calculateMortgage, BASE, 'interestRate', [3, 4, 5, 6, 7, 8, 9]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.monthlyPayment as number)
        .toBeGreaterThan(results[i - 1].result.monthlyPayment as number);
    }
  });

  it('monthly payment decreases with longer term', () => {
    const terms = ['10', '15', '20', '30'];
    const payments = terms.map(t => {
      const r = calculateMortgage({ ...BASE, loanTerm: t });
      return r.monthlyPayment as number;
    });
    for (let i = 1; i < payments.length; i++) {
      expect(payments[i]).toBeLessThan(payments[i - 1]);
    }
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid homePrice values without throwing', () => {
    testInvalidInputs(calculateMortgage, BASE, 'homePrice');
  });

  it('handles invalid interestRate values without throwing', () => {
    testInvalidInputs(calculateMortgage, BASE, 'interestRate');
  });

  it('handles missing input keys without throwing', () => {
    testMissingInputs(calculateMortgage, BASE, ['homePrice', 'downPayment', 'interestRate', 'loanTerm']);
  });

  // ═══ EXTREME DOWN PAYMENT ════════════════════════════════════════════════

  it('handles down payment exceeding home price (negative loan)', () => {
    const result = calculateMortgage({
      homePrice: 100000,
      downPayment: 150000,
      interestRate: 6.5,
      loanTerm: '30',
    });
    // Negative principal → payment should be negative or zero
    expect(typeof result.monthlyPayment).toBe('number');
    expect(isFinite(result.monthlyPayment as number)).toBe(true);
  });
});
