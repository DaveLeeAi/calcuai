import { calculateCompoundInterest } from '@/lib/formulas/finance/compound-interest';
import {
  expectCurrencyPrecision,
  expectNonNegativeFiniteNumber,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
} from '../../helpers/formula-test-utils';

const BASE = {
  initialDeposit: 10000,
  monthlyContribution: 500,
  annualRate: 7,
  compoundingFrequency: '12',
  years: 20,
};

describe('calculateCompoundInterest — edge cases & regression', () => {
  // ═══ PRECISION REGRESSION ══════════════════════════════════════════════════

  it('pins exact future value for $10k + $500/mo at 7% / 20yr monthly', () => {
    const result = calculateCompoundInterest(BASE);
    expectCurrencyPrecision(result, 'futureValue', 300850.72);
  });

  it('pins exact future value for $10k at 5% / 10yr monthly (no contributions)', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '12',
      years: 10,
    });
    expectCurrencyPrecision(result, 'futureValue', 16470.09);
  });

  it('pins exact total interest for $10k at 5% / 10yr monthly', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 10000,
      monthlyContribution: 0,
      annualRate: 5,
      compoundingFrequency: '12',
      years: 10,
    });
    expectCurrencyPrecision(result, 'totalInterest', 6470.09);
  });

  // ═══ COMPOUNDING FREQUENCY EDGE CASES ═══════════════════════════════════

  it('quarterly compounding gives less than monthly, more than annual', () => {
    const monthly = calculateCompoundInterest({
      ...BASE,
      monthlyContribution: 0,
      compoundingFrequency: '12',
    });
    const quarterly = calculateCompoundInterest({
      ...BASE,
      monthlyContribution: 0,
      compoundingFrequency: '4',
    });
    const annual = calculateCompoundInterest({
      ...BASE,
      monthlyContribution: 0,
      compoundingFrequency: '1',
    });
    expect(monthly.futureValue as number).toBeGreaterThan(quarterly.futureValue as number);
    expect(quarterly.futureValue as number).toBeGreaterThan(annual.futureValue as number);
  });

  it('semi-annual compounding is between quarterly and annual', () => {
    const quarterly = calculateCompoundInterest({
      ...BASE,
      monthlyContribution: 0,
      compoundingFrequency: '4',
    });
    const semiAnnual = calculateCompoundInterest({
      ...BASE,
      monthlyContribution: 0,
      compoundingFrequency: '2',
    });
    const annual = calculateCompoundInterest({
      ...BASE,
      monthlyContribution: 0,
      compoundingFrequency: '1',
    });
    expect(quarterly.futureValue as number).toBeGreaterThan(semiAnnual.futureValue as number);
    expect(semiAnnual.futureValue as number).toBeGreaterThan(annual.futureValue as number);
  });

  // ═══ BOUNDARY CASES ════════════════════════════════════════════════════

  it('handles very small rate (0.01%)', () => {
    const result = calculateCompoundInterest({
      ...BASE,
      annualRate: 0.01,
    });
    expectNonNegativeFiniteNumber(result, 'futureValue');
    // At near-zero rate, future value is very close to total contributions ($130k)
    // but still slightly more due to tiny interest
    const fv = result.futureValue as number;
    expect(fv).toBeGreaterThan(130000);
    expect(fv).toBeLessThan(131000);
  });

  it('handles very high rate (50%) without overflow', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 1000,
      monthlyContribution: 0,
      annualRate: 50,
      compoundingFrequency: '12',
      years: 10,
    });
    expectNonNegativeFiniteNumber(result, 'futureValue');
    expect(isFinite(result.futureValue as number)).toBe(true);
  });

  it('handles 1-year period', () => {
    const result = calculateCompoundInterest({
      ...BASE,
      years: 1,
    });
    expectNonNegativeFiniteNumber(result, 'futureValue');
    const growthData = result.growthOverTime as Array<{ year: number }>;
    expect(growthData).toHaveLength(2); // year 0 + year 1
  });

  it('handles 50-year period without overflow', () => {
    const result = calculateCompoundInterest({
      ...BASE,
      years: 50,
    });
    expectNonNegativeFiniteNumber(result, 'futureValue');
    expect(isFinite(result.futureValue as number)).toBe(true);
  });

  // ═══ CROSS-FIELD INVARIANTS ═══════════════════════════════════════════════

  it('futureValue = totalContributions + totalInterest', () => {
    const result = calculateCompoundInterest(BASE);
    const fv = result.futureValue as number;
    const tc = result.totalContributions as number;
    const ti = result.totalInterest as number;
    expect(fv).toBeCloseTo(tc + ti, 1);
  });

  it('growth over time final balance matches futureValue', () => {
    const result = calculateCompoundInterest(BASE);
    const growthData = result.growthOverTime as Array<{ year: number; balance: number }>;
    const last = growthData[growthData.length - 1];
    expect(last.balance).toBeCloseTo(result.futureValue as number, 0);
  });

  it('growth over time is monotonically increasing (with positive rate)', () => {
    const result = calculateCompoundInterest(BASE);
    const growthData = result.growthOverTime as Array<{ balance: number }>;
    for (let i = 1; i < growthData.length; i++) {
      expect(growthData[i].balance).toBeGreaterThanOrEqual(growthData[i - 1].balance);
    }
  });

  // ═══ MONOTONICITY ════════════════════════════════════════════════════════

  it('future value increases with rate', () => {
    const results = sweepInput(calculateCompoundInterest, BASE, 'annualRate', [1, 3, 5, 7, 10, 15]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.futureValue as number)
        .toBeGreaterThan(results[i - 1].result.futureValue as number);
    }
  });

  it('future value increases with years', () => {
    const results = sweepInput(calculateCompoundInterest, BASE, 'years', [1, 5, 10, 20, 30]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.futureValue as number)
        .toBeGreaterThan(results[i - 1].result.futureValue as number);
    }
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid initialDeposit without throwing', () => {
    testInvalidInputs(calculateCompoundInterest, BASE, 'initialDeposit');
  });

  it('handles invalid annualRate without throwing', () => {
    testInvalidInputs(calculateCompoundInterest, BASE, 'annualRate');
  });

  it('handles missing input keys without throwing', () => {
    testMissingInputs(calculateCompoundInterest, BASE, [
      'initialDeposit', 'monthlyContribution', 'annualRate', 'compoundingFrequency', 'years',
    ]);
  });

  // ═══ ALL ZEROS ════════════════════════════════════════════════════════════

  it('returns zero future value when all inputs are zero', () => {
    const result = calculateCompoundInterest({
      initialDeposit: 0,
      monthlyContribution: 0,
      annualRate: 0,
      compoundingFrequency: '12',
      years: 0,
    });
    expect(result.futureValue).toBe(0);
    expect(result.totalContributions).toBe(0);
    expect(result.totalInterest).toBe(0);
  });
});
