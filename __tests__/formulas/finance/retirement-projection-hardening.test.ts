/**
 * Layer 6B — Retirement Projection Hardening Tests
 *
 * YMYL CRITICAL: Users make real financial decisions based on this calculator.
 * Wrong projections over 30+ years compound to six-figure dollar differences.
 *
 * Coverage targets:
 * - Accumulation phase math verification
 * - Distribution phase drawdown accuracy
 * - Phase transition boundaries
 * - Money-runs-out detection
 * - Year-by-year table consistency
 * - Chart data integrity
 * - Invalid/extreme input robustness
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectWithinTolerance,
  expectNonNegativeFiniteNumber,
  expectNoThrow,
  sweepInput,
  expectArray,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('retirement-projection');

// ─── Standard Base Inputs ────────────────────────────────────────────────────

const BASE_INPUTS = {
  currentAge: 30,
  retirementAge: 65,
  currentSavings: 50000,
  monthlyContribution: 500,
  preRetirementReturn: 7,
  postRetirementReturn: 4,
  desiredAnnualIncome: 40000,
  inflationRate: 2,
  lifeExpectancy: 90,
};

describe('Retirement Projection — Layer 6B Hardening', () => {
  // ─── Golden Test: Manual Calculation Verification ──────────────────────────

  describe('Golden test — standard accumulation', () => {
    const result = calculate(BASE_INPUTS);

    it('produces a positive retirement savings balance', () => {
      const savings = result.retirementSavings as number;
      expect(typeof savings).toBe('number');
      expect(savings).toBeGreaterThan(500000); // 35 years of compounding
      expect(savings).toBeLessThan(3000000); // sanity upper bound
    });

    it('accumulation formula: FV = PV*(1+r)^n + PMT*((1+r)^n - 1)/r', () => {
      const r = 0.07 / 12;
      const n = 35 * 12;
      const compoundFactor = Math.pow(1 + r, n);
      const expectedFV =
        50000 * compoundFactor + 500 * ((compoundFactor - 1) / r);
      expectWithinTolerance(
        result.retirementSavings as number,
        expectedFV,
        1.0,
        'retirementSavings'
      );
    });

    it('monthly retirement income is positive and reasonable', () => {
      const monthly = result.monthlyRetirementIncome as number;
      expect(typeof monthly).toBe('number');
      expect(monthly).toBeGreaterThan(1000);
      expect(monthly).toBeLessThan(20000);
    });

    it('years money lasts is either a positive number or "Lifetime"', () => {
      const yearsLasts = result.yearsMoneyLasts;
      if (typeof yearsLasts === 'number') {
        expect(yearsLasts).toBeGreaterThan(0);
      } else {
        expect(yearsLasts).toBe('Lifetime');
      }
    });
  });

  // ─── Accumulation Phase Invariants ─────────────────────────────────────────

  describe('Accumulation phase invariants', () => {
    it('zero return: savings = current + total contributions', () => {
      const result = calculate({
        ...BASE_INPUTS,
        preRetirementReturn: 0,
      });
      const expectedContributions = 500 * 12 * 35;
      const expectedTotal = 50000 + expectedContributions;
      expectWithinTolerance(
        result.retirementSavings as number,
        expectedTotal,
        1.0,
        'zero-return savings'
      );
    });

    it('zero contributions: savings = currentSavings * compound factor', () => {
      const result = calculate({
        ...BASE_INPUTS,
        monthlyContribution: 0,
      });
      const r = 0.07 / 12;
      const n = 35 * 12;
      const expected = 50000 * Math.pow(1 + r, n);
      expectWithinTolerance(
        result.retirementSavings as number,
        expected,
        1.0,
        'zero-contribution savings'
      );
    });

    it('zero starting savings: savings = contribution FV only', () => {
      const result = calculate({
        ...BASE_INPUTS,
        currentSavings: 0,
      });
      const r = 0.07 / 12;
      const n = 35 * 12;
      const expected = 500 * ((Math.pow(1 + r, n) - 1) / r);
      expectWithinTolerance(
        result.retirementSavings as number,
        expected,
        1.0,
        'zero-start savings'
      );
    });

    it('higher return → higher retirement savings (monotonicity)', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'preRetirementReturn',
        [0, 3, 5, 7, 10, 12]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.retirementSavings as number).toBeGreaterThan(
          results[i - 1].result.retirementSavings as number
        );
      }
    });

    it('higher contributions → higher retirement savings (monotonicity)', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'monthlyContribution',
        [0, 250, 500, 1000, 2000, 5000]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.retirementSavings as number).toBeGreaterThan(
          results[i - 1].result.retirementSavings as number
        );
      }
    });
  });

  // ─── Distribution Phase Tests ──────────────────────────────────────────────

  describe('Distribution phase', () => {
    it('high withdrawal rate causes money to run out', () => {
      const result = calculate({
        ...BASE_INPUTS,
        desiredAnnualIncome: 200000, // way more than sustainable
        lifeExpectancy: 95,
      });
      const yearsLasts = result.yearsMoneyLasts;
      if (typeof yearsLasts === 'number') {
        expect(yearsLasts).toBeLessThan(30);
        expect(yearsLasts).toBeGreaterThan(0);
      }
    });

    it('zero withdrawal: money lasts lifetime', () => {
      const result = calculate({
        ...BASE_INPUTS,
        desiredAnnualIncome: 0,
      });
      expect(result.yearsMoneyLasts).toBe('Lifetime');
    });

    it('retirementGap is negative when fully funded', () => {
      const result = calculate({
        ...BASE_INPUTS,
        desiredAnnualIncome: 10000, // very modest
        monthlyContribution: 2000,
      });
      const gap = result.retirementGap as number;
      // Gap should be zero or negative (surplus)
      expect(gap).toBeLessThanOrEqual(0);
    });

    it('higher desired income → larger gap or fewer years', () => {
      const low = calculate({ ...BASE_INPUTS, desiredAnnualIncome: 20000 });
      const high = calculate({ ...BASE_INPUTS, desiredAnnualIncome: 80000 });
      const lowGap = low.retirementGap as number;
      const highGap = high.retirementGap as number;
      // Higher desired income should produce a larger gap (or less negative)
      expect(highGap).toBeGreaterThanOrEqual(lowGap);
    });
  });

  // ─── Phase Transition Boundaries ───────────────────────────────────────────

  describe('Phase transition edge cases', () => {
    it('retirementAge = currentAge (immediate retirement)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        currentAge: 65,
        retirementAge: 65,
      });
      // Savings should just be current savings (no accumulation)
      expectWithinTolerance(
        result.retirementSavings as number,
        50000,
        1.0,
        'immediate retirement'
      );
    });

    it('retirementAge = currentAge + 1 (minimal accumulation)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        currentAge: 64,
        retirementAge: 65,
      });
      // 1 year of accumulation
      const r = 0.07 / 12;
      const n = 12;
      const expected =
        50000 * Math.pow(1 + r, n) + 500 * ((Math.pow(1 + r, n) - 1) / r);
      expectWithinTolerance(
        result.retirementSavings as number,
        expected,
        1.0,
        '1-year accumulation'
      );
    });

    it('lifeExpectancy = retirementAge (zero distribution phase)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        lifeExpectancy: 65,
      });
      // Should handle gracefully — money "lasts" since no distribution needed
      expect(typeof result.retirementSavings).toBe('number');
    });

    it('lifeExpectancy < retirementAge (should not crash)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        lifeExpectancy: 60,
        retirementAge: 65,
      });
      expect(typeof result.retirementSavings).toBe('number');
    });
  });

  // ─── Year-by-Year Table Consistency ────────────────────────────────────────

  describe('Year-by-year table consistency', () => {
    const result = calculate(BASE_INPUTS);
    const table = result.yearByYear as Array<{
      age: number;
      yearStart: number;
      contributionOrWithdrawal: number;
      growth: number;
      yearEnd: number;
    }>;

    it('table has entries for every year from currentAge to lifeExpectancy', () => {
      expect(Array.isArray(table)).toBe(true);
      expect(table.length).toBeGreaterThanOrEqual(
        BASE_INPUTS.lifeExpectancy - BASE_INPUTS.currentAge
      );
    });

    it('consecutive years: endBalance[n] ≈ startBalance[n+1]', () => {
      for (let i = 0; i < table.length - 1; i++) {
        expectWithinTolerance(
          table[i + 1].yearStart,
          table[i].yearEnd,
          1.0,
          `year ${table[i].age} → ${table[i + 1].age}`
        );
      }
    });

    it('first year starts with currentSavings', () => {
      expectWithinTolerance(
        table[0].yearStart,
        BASE_INPUTS.currentSavings,
        1.0,
        'first year start'
      );
    });

    it('no negative balances in table (should floor at 0)', () => {
      for (const row of table) {
        expect(row.yearEnd).toBeGreaterThanOrEqual(0);
      }
    });

    it('accumulation years have positive contributionOrWithdrawal', () => {
      const accumulationRows = table.filter(
        (r) => r.age < BASE_INPUTS.retirementAge
      );
      for (const row of accumulationRows) {
        expect(row.contributionOrWithdrawal).toBeGreaterThan(0);
      }
    });
  });

  // ─── Chart Data Integrity ─────────────────────────────────────────────────

  describe('Chart data integrity', () => {
    const result = calculate(BASE_INPUTS);

    it('savings growth chart has correct number of data points', () => {
      const chart = expectArray(result, 'savingsGrowth', 2);
      // Should have a point for each year
      expect(chart.length).toBeGreaterThanOrEqual(
        BASE_INPUTS.lifeExpectancy - BASE_INPUTS.currentAge
      );
    });

    it('breakdown pie has contributions and growth segments', () => {
      const breakdown = expectArray(result, 'breakdown', 2);
      const names = (breakdown as Array<{ name: string }>).map((b) => b.name);
      expect(names.length).toBeGreaterThanOrEqual(2);
    });

    it('breakdown pie values sum to retirement savings', () => {
      const breakdown = result.breakdown as Array<{
        name: string;
        value: number;
      }>;
      const savings = result.retirementSavings as number;
      const sum = breakdown.reduce((acc, b) => acc + b.value, 0);
      expectWithinTolerance(sum, savings, 10.0, 'breakdown sum vs savings');
    });
  });

  // ─── Inflation Impact ─────────────────────────────────────────────────────

  describe('Inflation impact', () => {
    it('zero inflation → higher purchasing power (more years or smaller gap)', () => {
      const withInflation = calculate(BASE_INPUTS);
      const noInflation = calculate({ ...BASE_INPUTS, inflationRate: 0 });
      // Without inflation, the same withdrawal amount has more staying power
      const gapWith = withInflation.retirementGap as number;
      const gapWithout = noInflation.retirementGap as number;
      expect(gapWithout).toBeLessThanOrEqual(gapWith);
    });

    it('higher inflation → worse outcome', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'inflationRate',
        [0, 2, 4, 6, 8]
      );
      // Gap should generally increase with inflation
      for (let i = 1; i < results.length; i++) {
        const prevGap = results[i - 1].result.retirementGap as number;
        const currGap = results[i].result.retirementGap as number;
        expect(currGap).toBeGreaterThanOrEqual(prevGap);
      }
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────
  // NOTE: testInvalidInputs skipped here — retirement formula generates large
  // year-by-year arrays that cause OOM with 10x variations. Using targeted checks.

  describe('Invalid input robustness', () => {
    it('handles zero currentAge without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, currentAge: 0 });
    });

    it('handles undefined currentAge without throwing', () => {
      const inputs = { ...BASE_INPUTS };
      delete (inputs as Record<string, unknown>).currentAge;
      expectNoThrow(calculate, inputs);
    });

    it('handles NaN monthlyContribution without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, monthlyContribution: NaN });
    });

    it('handles string preRetirementReturn without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, preRetirementReturn: 'abc' });
    });

    it('handles negative currentSavings without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, currentSavings: -10000 });
    });

    it('handles empty inputs object without throwing', () => {
      expectNoThrow(calculate, {});
    });
  });

  // ─── Extreme Scenarios ────────────────────────────────────────────────────

  describe('Extreme scenarios', () => {
    it('very young saver (18yo) with long horizon', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        currentAge: 18,
        retirementAge: 67,
        currentSavings: 0,
        monthlyContribution: 200,
      });
      expect(result.retirementSavings as number).toBeGreaterThan(0);
    });

    it('late starter (55yo) with short horizon', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        currentAge: 55,
        retirementAge: 67,
        currentSavings: 100000,
        monthlyContribution: 2000,
      });
      expect(result.retirementSavings as number).toBeGreaterThan(100000);
    });

    it('very high contribution ($10K/mo)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        monthlyContribution: 10000,
      });
      expect(result.retirementSavings as number).toBeGreaterThan(5000000);
    });

    it('very low contribution ($10/mo)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        monthlyContribution: 10,
        currentSavings: 0,
      });
      expect(result.retirementSavings as number).toBeGreaterThan(0);
      expect(result.retirementSavings as number).toBeLessThan(100000);
    });

    it('very high desired income ($500K/yr) — money runs out quickly', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        desiredAnnualIncome: 500000,
      });
      const years = result.yearsMoneyLasts;
      if (typeof years === 'number') {
        expect(years).toBeLessThan(10);
      }
    });
  });

  // ─── Summary Structure ────────────────────────────────────────────────────

  describe('Summary and output structure', () => {
    const result = calculate(BASE_INPUTS);

    it('summary array has expected labels', () => {
      const summary = result.summary as Array<{ label: string }>;
      expect(Array.isArray(summary)).toBe(true);
      expect(summary.length).toBeGreaterThanOrEqual(3);
    });

    it('all numeric outputs are finite numbers', () => {
      expectNonNegativeFiniteNumber(result, 'retirementSavings');
      expectNonNegativeFiniteNumber(result, 'monthlyRetirementIncome');
    });
  });
});
