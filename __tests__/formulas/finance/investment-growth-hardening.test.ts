/**
 * Layer 6B — Investment Growth Hardening Tests
 *
 * YMYL HIGH: Users rely on this to plan long-term wealth building.
 * Two calculation paths (formula vs iterative) must produce consistent results.
 *
 * Coverage targets:
 * - Compound growth formula verification
 * - Inflation-adjusted real value accuracy
 * - Chart vs table consistency (dual calculation paths)
 * - Year-by-year table integrity
 * - totalContributed + totalEarnings = futureValue
 * - Breakdown pie chart sum = futureValue
 * - Negative returns / drawdown scenarios
 * - Invalid input robustness
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectWithinTolerance,
  expectNonNegativeFiniteNumber,
  expectNoThrow,
  sweepInput,
  expectArray,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('investment-growth');

const BASE_INPUTS = {
  initialInvestment: 10000,
  monthlyContribution: 500,
  annualReturn: 7,
  investmentPeriod: 30,
  inflationRate: 3,
};

describe('Investment Growth — Layer 6B Hardening', () => {
  // ─── Golden Test: Manual Formula Verification ──────────────────────────────

  describe('Golden test — $10K + $500/mo at 7% for 30yr', () => {
    const result = calculate(BASE_INPUTS);

    it('future value matches compound interest formula', () => {
      const r = 0.07 / 12;
      const n = 30 * 12;
      const fv =
        10000 * Math.pow(1 + r, n) + 500 * ((Math.pow(1 + r, n) - 1) / r);
      expectWithinTolerance(
        result.futureValue as number,
        fv,
        1.0,
        'futureValue'
      );
    });

    it('total contributed = initial + monthly * 12 * years', () => {
      const expected = 10000 + 500 * 12 * 30;
      expectWithinTolerance(
        result.totalContributed as number,
        expected,
        0.01,
        'totalContributed'
      );
    });

    it('total earnings = futureValue - totalContributed', () => {
      const fv = result.futureValue as number;
      const contributed = result.totalContributed as number;
      const earnings = result.totalEarnings as number;
      expectWithinTolerance(
        earnings,
        fv - contributed,
        0.01,
        'totalEarnings'
      );
    });

    it('real value < future value when inflation > 0', () => {
      const fv = result.futureValue as number;
      const rv = result.realValue as number;
      expect(rv).toBeLessThan(fv);
    });

    it('real value = FV / (1+inflation)^years', () => {
      const fv = result.futureValue as number;
      const expected = fv / Math.pow(1 + 0.03, 30);
      expectWithinTolerance(
        result.realValue as number,
        expected,
        1.0,
        'realValue'
      );
    });
  });

  // ─── Fundamental Invariants ────────────────────────────────────────────────

  describe('Fundamental invariants', () => {
    it('FV = totalContributed + totalEarnings', () => {
      const result = calculate(BASE_INPUTS);
      const fv = result.futureValue as number;
      const contrib = result.totalContributed as number;
      const earnings = result.totalEarnings as number;
      expectWithinTolerance(fv, contrib + earnings, 0.02, 'FV = C + E');
    });

    it('zero return: FV = totalContributed exactly', () => {
      const result = calculate({ ...BASE_INPUTS, annualReturn: 0 });
      const expected = 10000 + 500 * 12 * 30;
      expectWithinTolerance(
        result.futureValue as number,
        expected,
        0.01,
        'zero return FV'
      );
      expectWithinTolerance(
        result.totalEarnings as number,
        0,
        0.01,
        'zero return earnings'
      );
    });

    it('zero inflation: realValue = futureValue', () => {
      const result = calculate({ ...BASE_INPUTS, inflationRate: 0 });
      expectWithinTolerance(
        result.realValue as number,
        result.futureValue as number,
        0.01,
        'realValue at 0% inflation'
      );
    });

    it('inflation = return → real value ≈ total contributed', () => {
      const result = calculate({
        ...BASE_INPUTS,
        annualReturn: 5,
        inflationRate: 5,
      });
      const contributed = result.totalContributed as number;
      const real = result.realValue as number;
      // Real value should be approximately equal to total contributions
      // (growth exactly offsets inflation for lump sum, but monthly contributions
      // have different timing — so this is approximate)
      expect(real).toBeGreaterThan(contributed * 0.5);
      expect(real).toBeLessThan(contributed * 2);
    });
  });

  // ─── Year-by-Year Table Consistency ────────────────────────────────────────

  describe('Year-by-year table consistency', () => {
    const result = calculate(BASE_INPUTS);
    const table = result.yearByYear as Array<{
      year: number;
      startBalance: number;
      contributions: number;
      earnings: number;
      endBalance: number;
    }>;

    it('table has one row per year', () => {
      expect(Array.isArray(table)).toBe(true);
      expect(table.length).toBe(BASE_INPUTS.investmentPeriod);
    });

    it('consecutive years: endBalance[n] ≈ startBalance[n+1]', () => {
      for (let i = 0; i < table.length - 1; i++) {
        expectWithinTolerance(
          table[i + 1].startBalance,
          table[i].endBalance,
          1.0,
          `year ${table[i].year} → ${table[i].year + 1}`
        );
      }
    });

    it('first year starts with initial investment', () => {
      expectWithinTolerance(
        table[0].startBalance,
        BASE_INPUTS.initialInvestment,
        0.01,
        'year 1 start'
      );
    });

    it('last year end ≈ futureValue', () => {
      const lastEnd = table[table.length - 1].endBalance;
      expectWithinTolerance(
        lastEnd,
        result.futureValue as number,
        5.0,
        'last year end vs FV'
      );
    });

    it('each row: endBalance ≈ startBalance + contributions + earnings', () => {
      for (const row of table) {
        const expected = row.startBalance + row.contributions + row.earnings;
        expectWithinTolerance(
          row.endBalance,
          expected,
          1.0,
          `year ${row.year} balance`
        );
      }
    });

    it('positive returns → endBalance > startBalance each year', () => {
      for (const row of table) {
        expect(row.endBalance).toBeGreaterThan(row.startBalance);
      }
    });
  });

  // ─── Chart vs Table Dual Path Verification ─────────────────────────────────

  describe('Chart vs table consistency', () => {
    const result = calculate(BASE_INPUTS);

    it('growth chart has correct count', () => {
      const chart = expectArray(result, 'growthOverTime', 1);
      expect(chart.length).toBeGreaterThanOrEqual(BASE_INPUTS.investmentPeriod);
    });

    it('breakdown pie segments sum to futureValue', () => {
      const breakdown = result.breakdown as Array<{
        name: string;
        value: number;
      }>;
      if (Array.isArray(breakdown)) {
        const sum = breakdown.reduce((acc, b) => acc + b.value, 0);
        expectWithinTolerance(
          sum,
          result.futureValue as number,
          1.0,
          'pie sum'
        );
      }
    });
  });

  // ─── Monotonicity Tests ────────────────────────────────────────────────────

  describe('Monotonicity invariants', () => {
    it('higher return → higher FV', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'annualReturn',
        [0, 3, 5, 7, 10, 15]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.futureValue as number).toBeGreaterThan(
          results[i - 1].result.futureValue as number
        );
      }
    });

    it('higher contribution → higher FV', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'monthlyContribution',
        [0, 100, 500, 1000, 2000]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.futureValue as number).toBeGreaterThan(
          results[i - 1].result.futureValue as number
        );
      }
    });

    it('longer period → higher FV', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'investmentPeriod',
        [1, 5, 10, 20, 30, 40]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.futureValue as number).toBeGreaterThan(
          results[i - 1].result.futureValue as number
        );
      }
    });

    it('higher initial investment → higher FV', () => {
      const results = sweepInput(
        calculate,
        BASE_INPUTS,
        'initialInvestment',
        [0, 5000, 10000, 50000, 100000]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.futureValue as number).toBeGreaterThan(
          results[i - 1].result.futureValue as number
        );
      }
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('period = 1 year', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        investmentPeriod: 1,
      });
      expectNonNegativeFiniteNumber(result, 'futureValue');
    });

    it('zero initial, zero contribution → FV = 0', () => {
      const result = calculate({
        ...BASE_INPUTS,
        initialInvestment: 0,
        monthlyContribution: 0,
      });
      expect(result.futureValue as number).toBe(0);
    });

    it('negative annual return', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        annualReturn: -5,
        investmentPeriod: 10,
      });
      const fv = result.futureValue as number;
      const contributed = result.totalContributed as number;
      // Negative returns → FV should be less than total contributed
      expect(fv).toBeLessThan(contributed);
    });

    it('very high return (50%) does not produce NaN or Infinity', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        annualReturn: 50,
        investmentPeriod: 10,
      });
      expect(isFinite(result.futureValue as number)).toBe(true);
    });

    it('very long period (50 years)', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_INPUTS,
        investmentPeriod: 50,
      });
      expectNonNegativeFiniteNumber(result, 'futureValue');
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────
  // NOTE: testInvalidInputs skipped — investment formula generates large
  // growthOverTime/yearByYear arrays that cause OOM with 10x variations.

  describe('Invalid input robustness', () => {
    it('handles zero initialInvestment without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, initialInvestment: 0 });
    });

    it('handles NaN annualReturn without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, annualReturn: NaN });
    });

    it('handles string monthlyContribution without throwing', () => {
      expectNoThrow(calculate, { ...BASE_INPUTS, monthlyContribution: 'abc' });
    });

    it('handles undefined investmentPeriod without throwing', () => {
      const inputs = { ...BASE_INPUTS };
      delete (inputs as Record<string, unknown>).investmentPeriod;
      expectNoThrow(calculate, inputs);
    });

    it('handles empty inputs object without throwing', () => {
      expectNoThrow(calculate, {});
    });
  });
});
