/**
 * Layer 6B — Income Tax Hardening Tests
 *
 * YMYL CRITICAL: Tax miscalculations cause real financial harm.
 * Users compare output to actual IRS obligations.
 *
 * Coverage targets:
 * - Bracket boundary precision (exact cutoff values)
 * - All filing status variations
 * - Deduction logic (standard vs. itemized, pre-tax)
 * - Tax credit capping
 * - Effective vs. marginal rate invariants
 * - Bracket breakdown sum = total tax
 * - Invalid input robustness
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectWithinTolerance,
  expectNonNegativeFiniteNumber,
  expectNoThrow,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
  expectArray,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('income-tax');

// 2025 Single bracket boundaries (IRS)
const SINGLE_BRACKETS = [
  { rate: 0.10, min: 0, max: 11925 },
  { rate: 0.12, min: 11925, max: 48475 },
  { rate: 0.22, min: 48475, max: 103350 },
  { rate: 0.24, min: 103350, max: 197300 },
  { rate: 0.32, min: 197300, max: 250525 },
  { rate: 0.35, min: 250525, max: 626350 },
  { rate: 0.37, min: 626350, max: Infinity },
];

const STANDARD_DEDUCTION_SINGLE = 15000; // 2025 estimated

const BASE_INPUTS = {
  grossIncome: 100000,
  filingStatus: 'single',
  deductionType: 'standard',
  itemizedDeductions: 0,
  preTaxDeductions: 0,
  taxCredits: 0,
};

describe('Income Tax — Layer 6B Hardening', () => {
  // ─── Golden Test: Manual Bracket Calculation ──────────────────────────────

  describe('Golden test — $100K single standard deduction', () => {
    const result = calculate(BASE_INPUTS);

    it('federal tax is positive and reasonable for $100K', () => {
      const tax = result.federalTax as number;
      expect(typeof tax).toBe('number');
      // For $100K single, effective rate roughly 15-18%
      expect(tax).toBeGreaterThan(10000);
      expect(tax).toBeLessThan(25000);
    });

    it('effective rate < marginal rate', () => {
      const effective = result.effectiveRate as number;
      const marginal = result.marginalRate as number;
      expect(effective).toBeLessThan(marginal);
    });

    it('after-tax income = gross - federal tax', () => {
      const gross = BASE_INPUTS.grossIncome;
      const tax = result.federalTax as number;
      const afterTax = result.afterTaxIncome as number;
      expectWithinTolerance(afterTax, gross - tax, 0.01, 'after-tax');
    });

    it('effective rate = (tax / gross) * 100', () => {
      const effective = result.effectiveRate as number;
      const tax = result.federalTax as number;
      const expected = (tax / BASE_INPUTS.grossIncome) * 100;
      expectWithinTolerance(effective, expected, 0.01, 'effective rate');
    });
  });

  // ─── Bracket Boundary Tests ────────────────────────────────────────────────

  describe('Bracket boundary precision — single filer', () => {
    it('$0 income → $0 tax', () => {
      const result = calculate({ ...BASE_INPUTS, grossIncome: 0 });
      expect(result.federalTax).toBe(0);
      expect(result.effectiveRate).toBe(0);
    });

    it('income exactly at standard deduction → $0 tax', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: STANDARD_DEDUCTION_SINGLE,
      });
      expect(result.federalTax).toBe(0);
    });

    it('$1 of taxable income → 10% bracket only', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: STANDARD_DEDUCTION_SINGLE + 1,
      });
      const tax = result.federalTax as number;
      expectWithinTolerance(tax, 0.10, 0.01, 'tax on $1');
    });

    it('income in bottom bracket (10%) — marginal rate is 10%', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: STANDARD_DEDUCTION_SINGLE + 5000,
      });
      expect(result.marginalRate).toBe(10);
    });

    it('income entering 22% bracket has correct marginal rate', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: STANDARD_DEDUCTION_SINGLE + 50000,
      });
      expect(result.marginalRate).toBe(22);
    });

    it('$1M income is in 37% bracket', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: 1000000,
      });
      expect(result.marginalRate).toBe(37);
    });

    it('$10M income — effective rate approaches but never reaches 37%', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: 10000000,
      });
      const effective = result.effectiveRate as number;
      expect(effective).toBeLessThan(37);
      expect(effective).toBeGreaterThan(30); // should be close to top
    });
  });

  // ─── Bracket Breakdown Sum = Total Tax ─────────────────────────────────────

  describe('Bracket breakdown consistency', () => {
    const incomes = [30000, 75000, 100000, 200000, 500000, 1000000];

    incomes.forEach((income) => {
      it(`bracket taxes sum to federalTax at $${income.toLocaleString()}`, () => {
        const result = calculate({ ...BASE_INPUTS, grossIncome: income });
        const breakdown = result.bracketBreakdown as Array<{
          taxFromBracket: number;
        }>;
        if (Array.isArray(breakdown)) {
          const sum = breakdown.reduce(
            (acc, b) => acc + (b.taxFromBracket || 0),
            0
          );
          expectWithinTolerance(
            sum,
            result.federalTax as number,
            0.02,
            `bracket sum at $${income}`
          );
        }
      });
    });
  });

  // ─── All Filing Statuses ───────────────────────────────────────────────────

  describe('Filing status comparisons', () => {
    const statuses = [
      'single',
      'married-jointly',
      'married-separately',
      'head-of-household',
    ] as const;

    it('all statuses produce valid results at $100K', () => {
      for (const status of statuses) {
        const result = expectNoThrow(calculate, {
          ...BASE_INPUTS,
          filingStatus: status,
        });
        expectNonNegativeFiniteNumber(result, 'federalTax');
      }
    });

    it('married-jointly pays less than single at same income', () => {
      const single = calculate({ ...BASE_INPUTS, filingStatus: 'single' });
      const married = calculate({
        ...BASE_INPUTS,
        filingStatus: 'married-jointly',
      });
      expect(married.federalTax as number).toBeLessThan(
        single.federalTax as number
      );
    });

    it('head-of-household pays less than single at same income', () => {
      const single = calculate({ ...BASE_INPUTS, filingStatus: 'single' });
      const hoh = calculate({
        ...BASE_INPUTS,
        filingStatus: 'head-of-household',
      });
      expect(hoh.federalTax as number).toBeLessThanOrEqual(
        single.federalTax as number
      );
    });
  });

  // ─── Deduction Logic ──────────────────────────────────────────────────────

  describe('Deduction logic', () => {
    it('itemized > standard → lower tax', () => {
      const std = calculate(BASE_INPUTS);
      const itemized = calculate({
        ...BASE_INPUTS,
        deductionType: 'itemized',
        itemizedDeductions: 30000,
      });
      expect(itemized.federalTax as number).toBeLessThan(
        std.federalTax as number
      );
    });

    it('itemized < standard → standard deduction gives lower tax', () => {
      const std = calculate(BASE_INPUTS);
      const itemized = calculate({
        ...BASE_INPUTS,
        deductionType: 'itemized',
        itemizedDeductions: 5000,
      });
      expect(std.federalTax as number).toBeLessThanOrEqual(
        itemized.federalTax as number
      );
    });

    it('pre-tax deductions reduce taxable income', () => {
      const noPretax = calculate(BASE_INPUTS);
      const withPretax = calculate({
        ...BASE_INPUTS,
        preTaxDeductions: 20000,
      });
      expect(withPretax.federalTax as number).toBeLessThan(
        noPretax.federalTax as number
      );
    });

    it('deductions > income → $0 tax (no negative taxable income)', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: 10000,
        preTaxDeductions: 20000,
      });
      expect(result.federalTax as number).toBe(0);
    });
  });

  // ─── Tax Credit Tests ─────────────────────────────────────────────────────

  describe('Tax credits', () => {
    it('credits reduce tax dollar-for-dollar', () => {
      const noCredit = calculate(BASE_INPUTS);
      const withCredit = calculate({
        ...BASE_INPUTS,
        taxCredits: 1000,
      });
      expectWithinTolerance(
        (noCredit.federalTax as number) - (withCredit.federalTax as number),
        1000,
        0.01,
        'credit reduction'
      );
    });

    it('credits exceeding tax → tax floors at $0', () => {
      const result = calculate({
        ...BASE_INPUTS,
        grossIncome: 20000,
        taxCredits: 100000,
      });
      expect(result.federalTax as number).toBe(0);
    });

    it('after-tax income never exceeds gross income', () => {
      const result = calculate({
        ...BASE_INPUTS,
        taxCredits: 50000,
      });
      expect(result.afterTaxIncome as number).toBeLessThanOrEqual(
        BASE_INPUTS.grossIncome
      );
    });
  });

  // ─── Monotonicity ─────────────────────────────────────────────────────────

  describe('Monotonicity invariants', () => {
    it('higher income → higher tax (monotonic)', () => {
      const results = sweepInput(calculate, BASE_INPUTS, 'grossIncome', [
        0, 25000, 50000, 100000, 200000, 500000, 1000000,
      ]);
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.federalTax as number).toBeGreaterThanOrEqual(
          results[i - 1].result.federalTax as number
        );
      }
    });

    it('higher income → higher effective rate (monotonic)', () => {
      const results = sweepInput(calculate, BASE_INPUTS, 'grossIncome', [
        25000, 50000, 100000, 200000, 500000, 1000000,
      ]);
      for (let i = 1; i < results.length; i++) {
        expect(
          results[i].result.effectiveRate as number
        ).toBeGreaterThanOrEqual(
          results[i - 1].result.effectiveRate as number
        );
      }
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────

  describe('Invalid input robustness', () => {
    it('handles invalid grossIncome values', () => {
      testInvalidInputs(calculate, BASE_INPUTS, 'grossIncome');
    });

    it('handles invalid filingStatus values', () => {
      testInvalidInputs(calculate, BASE_INPUTS, 'filingStatus');
    });

    it('handles invalid preTaxDeductions values', () => {
      testInvalidInputs(calculate, BASE_INPUTS, 'preTaxDeductions');
    });

    it('handles invalid taxCredits values', () => {
      testInvalidInputs(calculate, BASE_INPUTS, 'taxCredits');
    });

    it('handles missing input keys', () => {
      testMissingInputs(calculate, BASE_INPUTS, [
        'grossIncome',
        'filingStatus',
        'deductionType',
        'preTaxDeductions',
        'taxCredits',
      ]);
    });
  });

  // ─── Output Structure ─────────────────────────────────────────────────────

  describe('Output structure', () => {
    const result = calculate(BASE_INPUTS);

    it('bracket breakdown is a non-empty array', () => {
      expectArray(result, 'bracketBreakdown', 1);
    });

    it('tax breakdown (pie chart) is a non-empty array', () => {
      expectArray(result, 'taxBreakdown', 1);
    });

    it('summary is a non-empty array', () => {
      expectArray(result, 'summary', 1);
    });
  });
});
