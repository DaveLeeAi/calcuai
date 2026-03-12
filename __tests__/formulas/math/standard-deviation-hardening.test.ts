/**
 * Layer 6B — Standard Deviation Hardening Tests
 *
 * ACADEMIC ACCURACY: Students and researchers rely on this.
 * Bessel's correction and floating-point precision are key risks.
 *
 * Coverage targets:
 * - Population vs sample SD relationship (sample >= population)
 * - Variance = SD² identity
 * - Known dataset golden tests
 * - Outlier impact
 * - Step-by-step table consistency
 * - Invalid input robustness
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectWithinTolerance,
  expectNoThrow,
  testInvalidInputs,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('standard-deviation');

describe('Standard Deviation — Layer 6B Hardening', () => {
  // ─── Golden Tests: Known Datasets ─────────────────────────────────────────

  describe('Golden test — textbook dataset [2, 4, 4, 4, 5, 5, 7, 9]', () => {
    const data = '2, 4, 4, 4, 5, 5, 7, 9';

    it('population SD = 2.0 exactly', () => {
      const result = calculate({
        dataSet: data,
        calculationType: 'population',
      });
      expectWithinTolerance(
        result.standardDeviation as number,
        2.0,
        0.001,
        'population SD'
      );
    });

    it('sample SD > population SD (Bessel correction)', () => {
      const pop = calculate({
        dataSet: data,
        calculationType: 'population',
      });
      const sample = calculate({
        dataSet: data,
        calculationType: 'sample',
      });
      expect(sample.standardDeviation as number).toBeGreaterThan(
        pop.standardDeviation as number
      );
    });

    it('mean = 5.0', () => {
      const result = calculate({
        dataSet: data,
        calculationType: 'population',
      });
      expectWithinTolerance(result.mean as number, 5.0, 0.001, 'mean');
    });

    it('range = 7 (max - min)', () => {
      const result = calculate({
        dataSet: data,
        calculationType: 'population',
      });
      expectWithinTolerance(result.range as number, 7, 0.001, 'range');
    });

    it('count = 8', () => {
      const result = calculate({
        dataSet: data,
        calculationType: 'population',
      });
      expect(result.count).toBe(8);
    });

    it('sum = 40', () => {
      const result = calculate({
        dataSet: data,
        calculationType: 'population',
      });
      expectWithinTolerance(result.sum as number, 40, 0.001, 'sum');
    });
  });

  // ─── Variance = SD² Identity ──────────────────────────────────────────────

  describe('Variance = SD² identity', () => {
    const datasets = [
      '1, 2, 3, 4, 5',
      '10, 20, 30, 40, 50',
      '3.5, 7.2, 8.1, 2.3, 5.9',
      '100, 200, 300',
    ];

    datasets.forEach((data) => {
      it(`variance = SD² for [${data}] (population)`, () => {
        const result = calculate({
          dataSet: data,
          calculationType: 'population',
        });
        const sd = result.standardDeviation as number;
        const variance = result.variance as number;
        expectWithinTolerance(variance, sd * sd, 0.001, 'variance vs SD²');
      });

      it(`variance = SD² for [${data}] (sample)`, () => {
        const result = calculate({
          dataSet: data,
          calculationType: 'sample',
        });
        const sd = result.standardDeviation as number;
        const variance = result.variance as number;
        expectWithinTolerance(variance, sd * sd, 0.001, 'variance vs SD²');
      });
    });
  });

  // ─── Sample vs Population Relationship ────────────────────────────────────

  describe('Sample SD >= Population SD (always)', () => {
    const datasets = [
      '1, 2, 3',
      '5, 10, 15, 20',
      '1, 1, 1, 100',
      '3.14, 2.72, 1.41, 1.73',
    ];

    datasets.forEach((data) => {
      it(`sample >= population for [${data}]`, () => {
        const pop = calculate({
          dataSet: data,
          calculationType: 'population',
        });
        const sample = calculate({
          dataSet: data,
          calculationType: 'sample',
        });
        expect(sample.standardDeviation as number).toBeGreaterThanOrEqual(
          pop.standardDeviation as number
        );
      });
    });
  });

  // ─── Special Cases ────────────────────────────────────────────────────────

  describe('Special cases', () => {
    it('single value: SD = 0', () => {
      const result = calculate({
        dataSet: '42',
        calculationType: 'population',
      });
      expect(result.standardDeviation).toBe(0);
      expect(result.variance).toBe(0);
    });

    it('single value sample: SD = 0 (not NaN from 0/0)', () => {
      const result = calculate({
        dataSet: '42',
        calculationType: 'sample',
      });
      expect(result.standardDeviation).toBe(0);
      expect(isNaN(result.standardDeviation as number)).toBe(false);
    });

    it('all identical values: SD = 0', () => {
      const result = calculate({
        dataSet: '5, 5, 5, 5, 5',
        calculationType: 'population',
      });
      expect(result.standardDeviation).toBe(0);
    });

    it('two values: population SD = half the range', () => {
      const result = calculate({
        dataSet: '10, 20',
        calculationType: 'population',
      });
      // Population SD of [10, 20]: mean=15, deviations=5, SD = 5
      expectWithinTolerance(
        result.standardDeviation as number,
        5,
        0.001,
        'two-value SD'
      );
    });

    it('negative values work correctly', () => {
      const result = calculate({
        dataSet: '-5, -3, -1, 1, 3, 5',
        calculationType: 'population',
      });
      // Symmetric around 0, mean=0, SD = sqrt(mean of squares)
      const expected = Math.sqrt((25 + 9 + 1 + 1 + 9 + 25) / 6);
      expectWithinTolerance(
        result.standardDeviation as number,
        expected,
        0.001,
        'negative values SD'
      );
    });

    it('empty dataset returns zeros', () => {
      const result = calculate({
        dataSet: '',
        calculationType: 'population',
      });
      expect(result.standardDeviation).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  // ─── Outlier Impact ────────────────────────────────────────────────────────

  describe('Outlier impact', () => {
    it('single outlier dramatically increases SD', () => {
      const without = calculate({
        dataSet: '1, 2, 3, 4, 5',
        calculationType: 'population',
      });
      const with_outlier = calculate({
        dataSet: '1, 2, 3, 4, 1000',
        calculationType: 'population',
      });
      expect(with_outlier.standardDeviation as number).toBeGreaterThan(
        (without.standardDeviation as number) * 10
      );
    });
  });

  // ─── Step-by-Step Table ────────────────────────────────────────────────────

  describe('Step-by-step table', () => {
    it('has one row per data point', () => {
      const result = calculate({
        dataSet: '2, 4, 6, 8, 10',
        calculationType: 'population',
      });
      const steps = result.stepByStep as Array<unknown>;
      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBe(5);
    });

    it('deviations sum to approximately zero', () => {
      const result = calculate({
        dataSet: '2, 4, 6, 8, 10',
        calculationType: 'population',
      });
      const steps = result.stepByStep as Array<{ deviation: number }>;
      const deviationSum = steps.reduce((s, r) => s + r.deviation, 0);
      expectWithinTolerance(deviationSum, 0, 0.001, 'deviation sum');
    });

    it('squared deviations are always non-negative', () => {
      const result = calculate({
        dataSet: '-5, 0, 5, 10, 15',
        calculationType: 'population',
      });
      const steps = result.stepByStep as Array<{ deviationSquared: number }>;
      for (const step of steps) {
        expect(step.deviationSquared).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // ─── Non-Numeric Filtering ────────────────────────────────────────────────

  describe('Non-numeric filtering', () => {
    it('filters out non-numeric entries', () => {
      const clean = calculate({
        dataSet: '1, 2, 3, 4, 5',
        calculationType: 'population',
      });
      const dirty = calculate({
        dataSet: '1, abc, 2, , 3, NaN, 4, null, 5',
        calculationType: 'population',
      });
      expect(dirty.standardDeviation).toBe(clean.standardDeviation);
      expect(dirty.count).toBe(clean.count);
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────

  describe('Invalid input robustness', () => {
    it('handles invalid dataSet values', () => {
      testInvalidInputs(
        calculate,
        { dataSet: '1, 2, 3', calculationType: 'population' },
        'dataSet'
      );
    });

    it('handles invalid calculationType values', () => {
      testInvalidInputs(
        calculate,
        { dataSet: '1, 2, 3', calculationType: 'population' },
        'calculationType'
      );
    });
  });
});
