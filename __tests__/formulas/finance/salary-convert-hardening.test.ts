/**
 * Layer 6B — Salary Converter Hardening Tests
 *
 * HIGH TRAFFIC: One of the most-searched calculator types.
 * Users compare job offers and verify pay stubs against this.
 *
 * Coverage targets:
 * - Frequency consistency (annual = monthly*12 = weekly*52 = biweekly*26)
 * - Hourly ↔ annual roundtrip consistency
 * - PTO/vacation day impact on adjusted rates
 * - Boundary conditions (0 hours, extreme hours)
 * - Salaried vs hourly PTO logic differences
 * - Invalid input robustness
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectWithinTolerance,
  expectNoThrow,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('salary-convert');

const BASE_ANNUAL = {
  inputMode: 'annual',
  annualSalary: 100000,
  hourlyRate: 0,
  hoursPerWeek: 40,
  weeksPerYear: 52,
  vacationDays: 0,
  holidays: 0,
};

const BASE_HOURLY = {
  inputMode: 'hourly',
  annualSalary: 0,
  hourlyRate: 25,
  hoursPerWeek: 40,
  weeksPerYear: 52,
  vacationDays: 0,
  holidays: 0,
};

describe('Salary Converter — Layer 6B Hardening', () => {
  // ─── Frequency Consistency ─────────────────────────────────────────────────

  describe('Frequency consistency — $100K annual', () => {
    const result = calculate(BASE_ANNUAL);

    it('monthly = annual / 12', () => {
      expectWithinTolerance(
        result.monthlySalary as number,
        100000 / 12,
        0.01,
        'monthly'
      );
    });

    it('biweekly = annual / 26', () => {
      expectWithinTolerance(
        result.biweeklySalary as number,
        100000 / 26,
        0.01,
        'biweekly'
      );
    });

    it('weekly = annual / 52', () => {
      expectWithinTolerance(
        result.weeklySalary as number,
        100000 / 52,
        0.01,
        'weekly'
      );
    });

    it('hourly = annual / (hours * weeks)', () => {
      expectWithinTolerance(
        result.hourlyRate as number,
        100000 / (40 * 52),
        0.01,
        'hourly'
      );
    });

    it('daily = annual / (weeks * 5)', () => {
      expectWithinTolerance(
        result.dailySalary as number,
        100000 / (52 * 5),
        0.01,
        'daily'
      );
    });
  });

  // ─── Hourly to Annual Conversion ──────────────────────────────────────────

  describe('Hourly to annual conversion — $25/hr', () => {
    const result = calculate(BASE_HOURLY);

    it('annual = hourly * hours * weeks', () => {
      expectWithinTolerance(
        result.annualSalary as number,
        25 * 40 * 52,
        0.01,
        'annual from hourly'
      );
    });

    it('monthly = annual / 12', () => {
      const annual = result.annualSalary as number;
      expectWithinTolerance(
        result.monthlySalary as number,
        annual / 12,
        0.01,
        'monthly from hourly'
      );
    });
  });

  // ─── Roundtrip Consistency ─────────────────────────────────────────────────

  describe('Roundtrip: annual ↔ hourly', () => {
    it('$100K annual → hourly → back to annual (within rounding tolerance)', () => {
      const step1 = calculate(BASE_ANNUAL);
      const hourly = step1.hourlyRate as number;

      const step2 = calculate({
        ...BASE_HOURLY,
        hourlyRate: hourly,
      });

      // Rounding drift is expected: $100K / 2080 = $48.0769... → round2 = $48.08
      // Then $48.08 * 2080 = $100,006.40. This is a known 2dp rounding artifact.
      expectWithinTolerance(
        step2.annualSalary as number,
        100000,
        10.0, // ±$10 tolerance for roundtrip rounding drift
        'roundtrip annual'
      );
    });

    it('$50/hr → annual → back to hourly (exact for round hourly rate)', () => {
      const step1 = calculate({
        ...BASE_HOURLY,
        hourlyRate: 50,
      });
      const annual = step1.annualSalary as number;
      // $50 * 40 * 52 = $104,000 exactly

      const step2 = calculate({
        ...BASE_ANNUAL,
        annualSalary: annual,
      });

      // $104,000 / 2080 = $50 exactly — no rounding drift for clean rate
      expectWithinTolerance(
        step2.hourlyRate as number,
        50,
        0.01,
        'roundtrip hourly'
      );
    });
  });

  // ─── PTO/Vacation Impact ──────────────────────────────────────────────────

  describe('PTO/vacation impact', () => {
    it('salaried: adjusted hourly > unadjusted hourly (fewer hours, same pay)', () => {
      const result = calculate({
        ...BASE_ANNUAL,
        vacationDays: 10,
        holidays: 10,
      });
      const unadj = result.hourlyRate as number;
      const adj = result.adjustedHourly as number;
      expect(adj).toBeGreaterThan(unadj);
    });

    it('salaried: adjusted annual = unadjusted annual (salary doesnt change)', () => {
      const result = calculate({
        ...BASE_ANNUAL,
        vacationDays: 15,
        holidays: 11,
      });
      expectWithinTolerance(
        result.adjustedAnnual as number,
        100000,
        0.01,
        'salaried adjusted annual'
      );
    });

    it('hourly: adjusted annual < unadjusted annual (fewer paid hours)', () => {
      const result = calculate({
        ...BASE_HOURLY,
        vacationDays: 10,
        holidays: 10,
      });
      const unadj = result.annualSalary as number;
      const adj = result.adjustedAnnual as number;
      expect(adj).toBeLessThan(unadj);
    });

    it('more vacation → lower adjusted annual for hourly workers', () => {
      const results = sweepInput(
        calculate,
        BASE_HOURLY,
        'vacationDays',
        [0, 5, 10, 15, 20]
      );
      for (let i = 1; i < results.length; i++) {
        expect(
          results[i].result.adjustedAnnual as number
        ).toBeLessThanOrEqual(
          results[i - 1].result.adjustedAnnual as number
        );
      }
    });
  });

  // ─── Boundary Conditions ──────────────────────────────────────────────────

  describe('Boundary conditions', () => {
    it('$0 salary → all frequencies are $0', () => {
      const result = calculate({
        ...BASE_ANNUAL,
        annualSalary: 0,
      });
      expect(result.annualSalary).toBe(0);
      expect(result.monthlySalary).toBe(0);
      expect(result.hourlyRate).toBe(0);
    });

    it('$0/hr → annual is $0', () => {
      const result = calculate({
        ...BASE_HOURLY,
        hourlyRate: 0,
      });
      expect(result.annualSalary).toBe(0);
    });

    it('part-time (20 hrs/wk) produces correct proportional pay', () => {
      const fullTime = calculate(BASE_ANNUAL);
      const partTime = calculate({
        ...BASE_ANNUAL,
        hoursPerWeek: 20,
      });
      // Same annual salary, but hourly rate should double
      expectWithinTolerance(
        partTime.hourlyRate as number,
        (fullTime.hourlyRate as number) * 2,
        0.01,
        'part-time hourly'
      );
    });

    it('minimum wage ($7.25/hr, 40hrs, 52wks)', () => {
      const result = calculate({
        ...BASE_HOURLY,
        hourlyRate: 7.25,
      });
      expectWithinTolerance(
        result.annualSalary as number,
        15080,
        0.01,
        'min wage annual'
      );
    });

    it('high salary ($500K) — no overflow', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_ANNUAL,
        annualSalary: 500000,
      });
      expect(typeof result.hourlyRate).toBe('number');
      expect(isFinite(result.hourlyRate as number)).toBe(true);
    });

    it('very high hourly ($1000/hr) — no overflow', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_HOURLY,
        hourlyRate: 1000,
      });
      expect(typeof result.annualSalary).toBe('number');
      expect(isFinite(result.annualSalary as number)).toBe(true);
    });
  });

  // ─── Salary Breakdown Table ────────────────────────────────────────────────

  describe('Salary breakdown table', () => {
    const result = calculate(BASE_ANNUAL);

    it('has 6 frequency rows', () => {
      const breakdown = result.salaryBreakdown as Array<unknown>;
      expect(Array.isArray(breakdown)).toBe(true);
      expect(breakdown.length).toBe(6);
    });
  });

  // ─── Working Days Calculation ──────────────────────────────────────────────

  describe('Working days/hours', () => {
    it('standard year: 260 work days (52 * 5)', () => {
      const result = calculate(BASE_ANNUAL);
      expectWithinTolerance(
        result.totalWorkingDays as number,
        260,
        0.01,
        'work days'
      );
    });

    it('standard year: 2080 work hours (52 * 40)', () => {
      const result = calculate(BASE_ANNUAL);
      expectWithinTolerance(
        result.totalWorkingHours as number,
        2080,
        0.01,
        'work hours'
      );
    });

    it('with PTO: working days decrease', () => {
      const result = calculate({
        ...BASE_ANNUAL,
        vacationDays: 10,
        holidays: 11,
      });
      const totalDays = result.totalWorkingDays as number;
      expect(totalDays).toBeLessThan(260);
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────

  describe('Invalid input robustness', () => {
    it('handles invalid annualSalary', () => {
      testInvalidInputs(calculate, BASE_ANNUAL, 'annualSalary');
    });

    it('handles invalid hourlyRate', () => {
      testInvalidInputs(calculate, BASE_HOURLY, 'hourlyRate');
    });

    it('handles invalid hoursPerWeek', () => {
      testInvalidInputs(calculate, BASE_ANNUAL, 'hoursPerWeek');
    });

    it('handles invalid vacationDays', () => {
      testInvalidInputs(calculate, BASE_ANNUAL, 'vacationDays');
    });

    it('handles missing input keys', () => {
      testMissingInputs(calculate, BASE_ANNUAL, [
        'inputMode',
        'annualSalary',
        'hoursPerWeek',
        'weeksPerYear',
      ]);
    });
  });
});
