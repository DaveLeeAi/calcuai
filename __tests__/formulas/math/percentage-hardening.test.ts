/**
 * Layer 6B — Percentage Calculator Hardening Tests
 *
 * TRAFFIC CRITICAL: Percentage calculator has the highest search volume
 * of any flagship. Multi-mode (percent-of, percent-change, percent-difference)
 * makes it complex, and Infinity handling is a known risk.
 *
 * Coverage targets:
 * - Floating-point precision at boundary values
 * - Division by zero handling (Infinity vs 0 vs NaN)
 * - Negative percentage inputs
 * - Very large and very small numbers
 * - Order independence for percent-difference
 * - Mathematical identity verifications
 * - Invalid input robustness
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectWithinTolerance,
  expectNoThrow,
  testInvalidInputs,
  sweepInput,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('percentage');

describe('Percentage Calculator — Layer 6B Hardening', () => {
  // ─── Percent-Of Mode ──────────────────────────────────────────────────────

  describe('Percent-of mode', () => {
    it('identity: 100% of X = X', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 100,
        baseValue: 42,
      });
      expect(result.result).toBe(42);
    });

    it('zero: 0% of X = 0', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 0,
        baseValue: 999,
      });
      expect(result.result).toBe(0);
    });

    it('negative percentage: -25% of 200 = -50', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: -25,
        baseValue: 200,
      });
      expect(result.result).toBe(-50);
    });

    it('large percentage: 500% of 100 = 500', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 500,
        baseValue: 100,
      });
      expect(result.result).toBe(500);
    });

    it('very small percentage: 0.001% of 1,000,000 = 10', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 0.001,
        baseValue: 1000000,
      });
      expectWithinTolerance(
        result.result as number,
        10,
        0.001,
        '0.001% of 1M'
      );
    });

    it('floating-point: 33.33% of 100 ≈ 33.33', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 33.33,
        baseValue: 100,
      });
      expectWithinTolerance(
        result.result as number,
        33.33,
        0.001,
        '33.33% of 100'
      );
    });

    it('1/3 as percentage: 33.333...% of 300 ≈ 100', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 100 / 3,
        baseValue: 300,
      });
      expectWithinTolerance(
        result.result as number,
        100,
        0.001,
        '1/3 of 300'
      );
    });

    it('negative base value: 50% of -200 = -100', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 50,
        baseValue: -200,
      });
      expect(result.result).toBe(-100);
    });

    it('both negative: -50% of -200 = 100', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: -50,
        baseValue: -200,
      });
      expect(result.result).toBe(100);
    });

    it('very large numbers: 15% of 1 billion', () => {
      const result = calculate({
        mode: 'percent-of',
        percentValue: 15,
        baseValue: 1000000000,
      });
      expectWithinTolerance(
        result.result as number,
        150000000,
        1,
        '15% of 1B'
      );
    });
  });

  // ─── Percent-Change Mode ──────────────────────────────────────────────────

  describe('Percent-change mode', () => {
    it('no change: 100 → 100 = 0%', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 100,
        newValue: 100,
      });
      expect(result.percentChange).toBe(0);
      expect(result.absoluteChange).toBe(0);
    });

    it('double: 100 → 200 = 100% increase', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 100,
        newValue: 200,
      });
      expect(result.percentChange).toBe(100);
    });

    it('half: 200 → 100 = -50% decrease', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 200,
        newValue: 100,
      });
      expect(result.percentChange).toBe(-50);
    });

    it('to zero: 100 → 0 = -100%', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 100,
        newValue: 0,
      });
      expect(result.percentChange).toBe(-100);
    });

    it('from zero to positive: 0 → 100 = Infinity (or handled)', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 0,
        newValue: 100,
      });
      // Formula returns Infinity or some special handling
      const pct = result.percentChange as number;
      expect(typeof pct).toBe('number');
      // Should be Infinity or a very large number — NOT NaN
      expect(isNaN(pct)).toBe(false);
    });

    it('from zero to zero: 0 → 0 = 0%', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 0,
        newValue: 0,
      });
      expect(result.percentChange).toBe(0);
    });

    it('negative to positive: -50 → 50 = -200% (uses |original|)', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: -50,
        newValue: 50,
      });
      // Change = (50 - (-50)) / |-50| * 100 = 200%
      const pct = result.percentChange as number;
      expect(pct).toBe(200);
    });

    it('positive to negative: 100 → -50 = -150%', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 100,
        newValue: -50,
      });
      expect(result.percentChange).toBe(-150);
    });

    it('absolute change is correct sign', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 80,
        newValue: 120,
      });
      expect(result.absoluteChange).toBe(40);
    });

    it('small percentage change: precision', () => {
      const result = calculate({
        mode: 'percent-change',
        originalValue: 1000,
        newValue: 1001,
      });
      expectWithinTolerance(
        result.percentChange as number,
        0.1,
        0.001,
        '0.1% change'
      );
    });
  });

  // ─── Percent-Difference Mode ──────────────────────────────────────────────

  describe('Percent-difference mode', () => {
    it('equal values: difference = 0%', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 100,
        value2: 100,
      });
      expect(result.percentDifference).toBe(0);
    });

    it('order independence: diff(A,B) = diff(B,A)', () => {
      const r1 = calculate({
        mode: 'percent-difference',
        value1: 100,
        value2: 200,
      });
      const r2 = calculate({
        mode: 'percent-difference',
        value1: 200,
        value2: 100,
      });
      expect(r1.percentDifference).toBe(r2.percentDifference);
    });

    it('difference is always non-negative', () => {
      const cases = [
        { value1: 100, value2: 200 },
        { value1: 200, value2: 100 },
        { value1: -50, value2: 50 },
        { value1: 1, value2: 1000 },
      ];
      for (const c of cases) {
        const result = calculate({ mode: 'percent-difference', ...c });
        expect(result.percentDifference as number).toBeGreaterThanOrEqual(0);
      }
    });

    it('both zero: difference = 0%', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 0,
        value2: 0,
      });
      expect(result.percentDifference).toBe(0);
    });

    it('one value zero: handles gracefully (Infinity or defined)', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 100,
        value2: 0,
      });
      const diff = result.percentDifference as number;
      expect(typeof diff).toBe('number');
      expect(isNaN(diff)).toBe(false);
    });

    it('average is correct', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 100,
        value2: 200,
      });
      expect(result.average).toBe(150);
    });

    it('absolute difference is correct', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 100,
        value2: 200,
      });
      expect(result.absoluteDifference).toBe(100);
    });

    it('50 vs 150: diff = |100| / 100 * 100 = 100%', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 50,
        value2: 150,
      });
      expectWithinTolerance(
        result.percentDifference as number,
        100,
        0.01,
        '50 vs 150'
      );
    });

    it('very close values: small percent difference', () => {
      const result = calculate({
        mode: 'percent-difference',
        value1: 100,
        value2: 100.1,
      });
      expectWithinTolerance(
        result.percentDifference as number,
        0.1,
        0.01,
        'close values'
      );
    });
  });

  // ─── Mathematical Identities ──────────────────────────────────────────────

  describe('Mathematical identities', () => {
    it('X% of Y = Y% of X (commutativity)', () => {
      const r1 = calculate({
        mode: 'percent-of',
        percentValue: 15,
        baseValue: 60,
      });
      const r2 = calculate({
        mode: 'percent-of',
        percentValue: 60,
        baseValue: 15,
      });
      expectWithinTolerance(
        r1.result as number,
        r2.result as number,
        0.001,
        'commutativity'
      );
    });

    it('double then halve: 200% then 50% returns to original', () => {
      const original = 100;
      const doubled = calculate({
        mode: 'percent-of',
        percentValue: 200,
        baseValue: original,
      });
      const halved = calculate({
        mode: 'percent-of',
        percentValue: 50,
        baseValue: doubled.result as number,
      });
      expectWithinTolerance(
        halved.result as number,
        original,
        0.001,
        'double-halve identity'
      );
    });

    it('percent change roundtrip: +50% then -33.33% ≈ original', () => {
      // 100 +50% = 150, then 150 -33.33% ≈ 100
      const r1 = calculate({
        mode: 'percent-change',
        originalValue: 100,
        newValue: 150,
      });
      expect(r1.percentChange).toBe(50);

      const r2 = calculate({
        mode: 'percent-change',
        originalValue: 150,
        newValue: 100,
      });
      // -33.33...%
      expectWithinTolerance(
        r2.percentChange as number,
        -100 / 3,
        0.01,
        'roundtrip'
      );
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────

  describe('Invalid input robustness', () => {
    it('handles invalid percentValue in percent-of mode', () => {
      testInvalidInputs(
        calculate,
        { mode: 'percent-of', percentValue: 50, baseValue: 100 },
        'percentValue'
      );
    });

    it('handles invalid baseValue in percent-of mode', () => {
      testInvalidInputs(
        calculate,
        { mode: 'percent-of', percentValue: 50, baseValue: 100 },
        'baseValue'
      );
    });

    it('handles invalid originalValue in percent-change mode', () => {
      testInvalidInputs(
        calculate,
        { mode: 'percent-change', originalValue: 100, newValue: 150 },
        'originalValue'
      );
    });

    it('handles invalid value1 in percent-difference mode', () => {
      testInvalidInputs(
        calculate,
        { mode: 'percent-difference', value1: 100, value2: 200 },
        'value1'
      );
    });
  });
});
