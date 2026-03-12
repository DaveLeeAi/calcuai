import { calculateAmortization } from '@/lib/formulas/finance/amortization';
import {
  expectCurrencyPrecision,
  expectNonNegativeFiniteNumber,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
} from '../../helpers/formula-test-utils';

const BASE = {
  loanAmount: 280000,
  interestRate: 6.5,
  loanTerm: 30,
  extraPayment: 0,
};

describe('calculateAmortization — edge cases & regression', () => {
  // ═══ PRECISION REGRESSION ══════════════════════════════════════════════════

  it('pins exact monthly payment for $280k at 6.5% / 30yr', () => {
    const result = calculateAmortization(BASE);
    expectCurrencyPrecision(result, 'monthlyPayment', 1769.79);
  });

  it('pins exact total interest for $280k at 6.5% / 30yr', () => {
    const result = calculateAmortization(BASE);
    // Total interest = (1769.79 * 360) - 280000 ≈ 357124.40
    expect(result.totalInterest).toBeCloseTo(357124.40, -1);
  });

  // ═══ EXTRA PAYMENT EFFECTS ════════════════════════════════════════════════

  it('extra payment reduces total interest paid', () => {
    const noExtra = calculateAmortization(BASE);
    const withExtra = calculateAmortization({ ...BASE, extraPayment: 200 });
    expect(withExtra.totalInterest as number).toBeLessThan(noExtra.totalInterest as number);
  });

  it('extra payment reduces payoff months', () => {
    const noExtra = calculateAmortization(BASE);
    const withExtra = calculateAmortization({ ...BASE, extraPayment: 500 });
    expect(withExtra.payoffMonths as number).toBeLessThan(noExtra.payoffMonths as number);
  });

  it('very large extra payment pays off loan in 1 month', () => {
    const result = calculateAmortization({ ...BASE, extraPayment: 300000 });
    expect(result.payoffMonths).toBe(1);
  });

  // ═══ SCHEDULE INVARIANTS ══════════════════════════════════════════════════

  it('schedule ends with balance at or near zero', () => {
    const result = calculateAmortization(BASE);
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    const lastRow = schedule[schedule.length - 1];
    expect(lastRow.balance).toBeCloseTo(0, 0);
  });

  it('total principal paid across schedule equals loan amount', () => {
    const result = calculateAmortization(BASE);
    const schedule = result.amortizationSchedule as Array<{ principal: number }>;
    const totalPrincipal = schedule.reduce((sum, row) => sum + row.principal, 0);
    expect(totalPrincipal).toBeCloseTo(280000, -1);
  });

  it('each row: payment = principal + interest (within rounding)', () => {
    const result = calculateAmortization(BASE);
    const schedule = result.amortizationSchedule as Array<{
      payment: number;
      principal: number;
      interest: number;
    }>;
    for (const row of schedule.slice(0, 12)) {
      expect(row.payment).toBeCloseTo(row.principal + row.interest, 0);
    }
  });

  it('balance is monotonically decreasing', () => {
    const result = calculateAmortization(BASE);
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThanOrEqual(schedule[i - 1].balance);
    }
  });

  // ═══ ZERO-RATE CASE ══════════════════════════════════════════════════════

  it('zero interest rate produces even payments', () => {
    const result = calculateAmortization({
      loanAmount: 120000,
      interestRate: 0,
      loanTerm: 10,
      extraPayment: 0,
    });
    expect(result.monthlyPayment).toBeCloseTo(1000, 0);
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });

  // ═══ BOUNDARY CASES ════════════════════════════════════════════════════

  it('handles zero loan amount', () => {
    const result = calculateAmortization({
      ...BASE,
      loanAmount: 0,
    });
    expect(result.monthlyPayment).toBe(0);
    expect(result.totalInterest).toBe(0);
  });

  it('handles very small loan ($100)', () => {
    const result = calculateAmortization({
      loanAmount: 100,
      interestRate: 6.5,
      loanTerm: 1,
      extraPayment: 0,
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    const schedule = result.amortizationSchedule as Array<{ balance: number }>;
    expect(schedule.length).toBeGreaterThan(0);
  });

  it('handles very large loan ($10M)', () => {
    const result = calculateAmortization({
      loanAmount: 10000000,
      interestRate: 5.0,
      loanTerm: 30,
      extraPayment: 0,
    });
    expectNonNegativeFiniteNumber(result, 'monthlyPayment');
    expect(isFinite(result.totalInterest as number)).toBe(true);
  });

  it('handles 1-year term', () => {
    const result = calculateAmortization({
      ...BASE,
      loanTerm: 1,
    });
    const schedule = result.amortizationSchedule as Array<{ month: number }>;
    expect(schedule.length).toBeLessThanOrEqual(12);
    expect(result.payoffMonths as number).toBeLessThanOrEqual(12);
  });

  // ═══ MONOTONICITY ════════════════════════════════════════════════════════

  it('total interest increases with rate', () => {
    const results = sweepInput(calculateAmortization, BASE, 'interestRate', [3, 4, 5, 6, 7, 8]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.totalInterest as number)
        .toBeGreaterThan(results[i - 1].result.totalInterest as number);
    }
  });

  it('monthly payment increases with rate', () => {
    const results = sweepInput(calculateAmortization, BASE, 'interestRate', [3, 4, 5, 6, 7, 8]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.monthlyPayment as number)
        .toBeGreaterThan(results[i - 1].result.monthlyPayment as number);
    }
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid loanAmount without throwing', () => {
    testInvalidInputs(calculateAmortization, BASE, 'loanAmount');
  });

  it('handles invalid interestRate without throwing', () => {
    testInvalidInputs(calculateAmortization, BASE, 'interestRate');
  });

  it('handles missing input keys without throwing', () => {
    testMissingInputs(calculateAmortization, BASE, [
      'loanAmount', 'interestRate', 'loanTerm', 'extraPayment',
    ]);
  });
});
