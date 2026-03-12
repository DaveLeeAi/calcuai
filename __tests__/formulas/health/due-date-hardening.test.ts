/**
 * Layer 6B — Due Date Calculator Hardening Tests
 *
 * YMYL HEALTH: Pregnancy calculations have high emotional weight.
 * Wrong dates cause real anxiety.
 *
 * Coverage targets:
 * - Naegele's Rule verification
 * - Cycle length adjustment accuracy
 * - Trimester boundary classification
 * - Milestone date ordering
 * - Progress percentage bounds
 * - Edge cases (leap year, year boundary, extreme cycles)
 */

import { getFormula } from '../../../lib/formulas';
import {
  expectNoThrow,
  testInvalidInputs,
} from '../../helpers/formula-test-utils';

const calculate = getFormula('due-date');

describe('Due Date — Layer 6B Hardening', () => {
  // ─── Naegele's Rule Verification ──────────────────────────────────────────

  describe("Naegele's Rule: LMP + 280 days + cycle adjustment", () => {
    it('standard 28-day cycle: EDD = LMP + 280', () => {
      const lmp = '2025-01-01';
      const result = calculate({ lastMenstrualPeriod: lmp, cycleLength: 28 });

      // Jan 1 + 280 days = Oct 8, 2025
      const expected = new Date('2025-01-01');
      expected.setDate(expected.getDate() + 280);
      const expectedISO = expected.toISOString().split('T')[0];

      expect(result.dueDate).toBe(expectedISO);
    });

    it('short cycle (25 days): EDD = LMP + 277', () => {
      const lmp = '2025-01-01';
      const result = calculate({ lastMenstrualPeriod: lmp, cycleLength: 25 });

      const expected = new Date('2025-01-01');
      expected.setDate(expected.getDate() + 280 + (25 - 28));
      const expectedISO = expected.toISOString().split('T')[0];

      expect(result.dueDate).toBe(expectedISO);
    });

    it('long cycle (35 days): EDD = LMP + 287', () => {
      const lmp = '2025-01-01';
      const result = calculate({ lastMenstrualPeriod: lmp, cycleLength: 35 });

      const expected = new Date('2025-01-01');
      expected.setDate(expected.getDate() + 280 + (35 - 28));
      const expectedISO = expected.toISOString().split('T')[0];

      expect(result.dueDate).toBe(expectedISO);
    });
  });

  // ─── Conception Date ──────────────────────────────────────────────────────

  describe('Conception date calculation', () => {
    it('standard cycle: conception = LMP + 14 days', () => {
      const lmp = '2025-03-01';
      const result = calculate({ lastMenstrualPeriod: lmp, cycleLength: 28 });

      const expected = new Date('2025-03-01');
      expected.setDate(expected.getDate() + 14);
      const expectedISO = expected.toISOString().split('T')[0];

      expect(result.conceptionDate).toBe(expectedISO);
    });

    it('short cycle (25d): conception = LMP + 11 days', () => {
      const lmp = '2025-03-01';
      const result = calculate({ lastMenstrualPeriod: lmp, cycleLength: 25 });

      const expected = new Date('2025-03-01');
      expected.setDate(expected.getDate() + (25 - 14));
      const expectedISO = expected.toISOString().split('T')[0];

      expect(result.conceptionDate).toBe(expectedISO);
    });
  });

  // ─── Trimester Classification ──────────────────────────────────────────────

  describe('Trimester classification', () => {
    it('trimester end dates are ordered: 1st < 2nd < dueDate', () => {
      const result = calculate({
        lastMenstrualPeriod: '2025-01-01',
        cycleLength: 28,
      });

      const first = new Date(result.firstTrimesterEnd as string);
      const second = new Date(result.secondTrimesterEnd as string);
      const due = new Date(result.dueDate as string);

      expect(first.getTime()).toBeLessThan(second.getTime());
      expect(second.getTime()).toBeLessThan(due.getTime());
    });

    it('first trimester ends around week 12-13', () => {
      const lmp = '2025-01-01';
      const result = calculate({ lastMenstrualPeriod: lmp, cycleLength: 28 });
      const lmpDate = new Date(lmp);
      const firstEnd = new Date(result.firstTrimesterEnd as string);
      const daysDiff = Math.round(
        (firstEnd.getTime() - lmpDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Week 12-13 = 84-91 days, with cycle adjustment
      expect(daysDiff).toBeGreaterThanOrEqual(80);
      expect(daysDiff).toBeLessThanOrEqual(100);
    });
  });

  // ─── Milestones ────────────────────────────────────────────────────────────

  describe('Milestone ordering', () => {
    const result = calculate({
      lastMenstrualPeriod: '2025-01-01',
      cycleLength: 28,
    });
    const milestones = result.milestones as Array<{
      week: number;
      date: string;
      description: string;
    }>;

    it('produces 11 milestones', () => {
      expect(Array.isArray(milestones)).toBe(true);
      expect(milestones.length).toBe(11);
    });

    it('milestones are in chronological order', () => {
      for (let i = 1; i < milestones.length; i++) {
        const prev = new Date(milestones[i - 1].date);
        const curr = new Date(milestones[i].date);
        expect(curr.getTime()).toBeGreaterThanOrEqual(prev.getTime());
      }
    });

    it('milestone weeks are non-decreasing', () => {
      for (let i = 1; i < milestones.length; i++) {
        expect(milestones[i].week).toBeGreaterThanOrEqual(
          milestones[i - 1].week
        );
      }
    });

    it('all milestone dates are between LMP and due date', () => {
      const lmp = new Date('2025-01-01').getTime();
      const due = new Date(result.dueDate as string).getTime();
      for (const m of milestones) {
        const d = new Date(m.date).getTime();
        expect(d).toBeGreaterThanOrEqual(lmp);
        expect(d).toBeLessThanOrEqual(due + 7 * 24 * 60 * 60 * 1000); // allow 1 week past due
      }
    });
  });

  // ─── Progress Percentage ──────────────────────────────────────────────────

  describe('Progress percentage', () => {
    it('progress is between 0 and 100', () => {
      const result = calculate({
        lastMenstrualPeriod: '2025-01-01',
        cycleLength: 28,
      });
      const progress = result.progressPercentage as number;
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('days remaining is non-negative', () => {
      const result = calculate({
        lastMenstrualPeriod: '2025-01-01',
        cycleLength: 28,
      });
      expect(result.daysRemaining as number).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('leap year: Feb 29 LMP', () => {
      const result = expectNoThrow(calculate, {
        lastMenstrualPeriod: '2024-02-29',
        cycleLength: 28,
      });
      expect(typeof result.dueDate).toBe('string');
    });

    it('year boundary crossing: LMP in April → due in January next year', () => {
      const result = calculate({
        lastMenstrualPeriod: '2025-04-01',
        cycleLength: 28,
      });
      const dueYear = new Date(result.dueDate as string).getFullYear();
      expect(dueYear).toBe(2026);
    });

    it('extreme short cycle (21 days)', () => {
      const result = expectNoThrow(calculate, {
        lastMenstrualPeriod: '2025-01-01',
        cycleLength: 21,
      });
      expect(typeof result.dueDate).toBe('string');
    });

    it('extreme long cycle (45 days)', () => {
      const result = expectNoThrow(calculate, {
        lastMenstrualPeriod: '2025-01-01',
        cycleLength: 45,
      });
      expect(typeof result.dueDate).toBe('string');
    });

    it('default cycle length when not provided', () => {
      const result = expectNoThrow(calculate, {
        lastMenstrualPeriod: '2025-01-01',
      });
      // Should default to 28
      const defaultResult = calculate({
        lastMenstrualPeriod: '2025-01-01',
        cycleLength: 28,
      });
      expect(result.dueDate).toBe(defaultResult.dueDate);
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────

  describe('Invalid input robustness', () => {
    it('handles invalid lastMenstrualPeriod values', () => {
      testInvalidInputs(
        calculate,
        { lastMenstrualPeriod: '2025-01-01', cycleLength: 28 },
        'lastMenstrualPeriod'
      );
    });

    it('handles invalid cycleLength values', () => {
      testInvalidInputs(
        calculate,
        { lastMenstrualPeriod: '2025-01-01', cycleLength: 28 },
        'cycleLength'
      );
    });
  });
});
