import { getFormula } from '@/lib/formulas/index';
import {
  expectCurrencyPrecision,
  expectNonNegativeFiniteNumber,
  testInvalidInputs,
  sweepInput,
} from '../../helpers/formula-test-utils';

const calculateLoanPayment = getFormula('loan-payment');

const BASE = {
  loanAmount: 25000,
  annualRate: 5.5,
  loanTerm: 60, // months
};

describe('loan-payment — edge cases & regression', () => {
  // ═══ PRECISION REGRESSION ══════════════════════════════════════════════════

  it('pins exact payment for $25k at 5.5% / 60mo', () => {
    const result = calculateLoanPayment(BASE);
    // $25,000 at 5.5% for 5 years → $477.53/mo
    expectCurrencyPrecision(result, 'monthlyPayment', 477.53);
  });

  it('pins exact payment for $10k at 3% / 36mo', () => {
    const result = calculateLoanPayment({
      loanAmount: 10000,
      annualRate: 3.0,
      loanTerm: 36,
    });
    // $10,000 at 3% for 3 years → $290.81/mo
    expectCurrencyPrecision(result, 'monthlyPayment', 290.81);
  });

  // ═══ ZERO-RATE EDGE CASE ═════════════════════════════════════════════════

  it('zero rate produces simple division payment', () => {
    const result = calculateLoanPayment({
      loanAmount: 12000,
      annualRate: 0,
      loanTerm: 12,
    });
    expect(result.monthlyPayment).toBeCloseTo(1000, 0);
  });

  // ═══ SHORT TERM ═══════════════════════════════════════════════════════════

  it('handles 1-month term', () => {
    const result = calculateLoanPayment({
      loanAmount: 5000,
      annualRate: 6.0,
      loanTerm: 1,
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    // Full loan + 1 month interest ≈ $5,025
    expect(result.monthlyPayment as number).toBeCloseTo(5025, -1);
  });

  // ═══ VERY HIGH RATE ══════════════════════════════════════════════════════

  it('handles 30% interest rate without overflow', () => {
    const result = calculateLoanPayment({
      loanAmount: 10000,
      annualRate: 30,
      loanTerm: 60,
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    expect(result.monthlyPayment as number).toBeGreaterThan(300);
  });

  // ═══ MONOTONICITY ════════════════════════════════════════════════════════

  it('payment increases with loan amount', () => {
    const results = sweepInput(calculateLoanPayment, BASE, 'loanAmount', [5000, 10000, 25000, 50000, 100000]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.monthlyPayment as number)
        .toBeGreaterThan(results[i - 1].result.monthlyPayment as number);
    }
  });

  it('payment increases with rate', () => {
    const results = sweepInput(calculateLoanPayment, BASE, 'annualRate', [1, 3, 5, 7, 10, 15]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.monthlyPayment as number)
        .toBeGreaterThan(results[i - 1].result.monthlyPayment as number);
    }
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid loanAmount without throwing', () => {
    testInvalidInputs(calculateLoanPayment, BASE, 'loanAmount');
  });

  it('handles invalid annualRate without throwing', () => {
    testInvalidInputs(calculateLoanPayment, BASE, 'annualRate');
  });
});
