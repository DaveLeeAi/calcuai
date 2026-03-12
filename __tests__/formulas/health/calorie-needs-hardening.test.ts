/**
 * Layer 6B — Calorie Needs Hardening Tests
 *
 * YMYL HEALTH: Users follow these calorie targets for weight management.
 * Wrong TDEE or macro splits can cause harm.
 *
 * Coverage targets:
 * - Mifflin-St Jeor BMR formula verification
 * - Activity multiplier accuracy
 * - Goal-based calorie adjustment (±500)
 * - Macro gram calculations (protein/carbs/fat calories sum to target)
 * - Imperial ↔ metric consistency
 * - Monotonicity invariants
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

const calculate = getFormula('calorie-needs');

const BASE_METRIC_MALE = {
  age: 30,
  sex: 'male',
  weight: 80,     // kg
  height: 180,    // cm
  unitSystem: 'metric',
  activityLevel: 'moderate',
  goal: 'maintain',
};

const BASE_METRIC_FEMALE = {
  ...BASE_METRIC_MALE,
  sex: 'female',
  weight: 65,
  height: 165,
};

const BASE_IMPERIAL_MALE = {
  age: 30,
  sex: 'male',
  weight: 176,    // lbs (≈ 80kg)
  height: 70.87,  // inches (≈ 180cm)
  unitSystem: 'imperial',
  activityLevel: 'moderate',
  goal: 'maintain',
};

describe('Calorie Needs — Layer 6B Hardening', () => {
  // ─── BMR Formula Verification ──────────────────────────────────────────────

  describe('Mifflin-St Jeor BMR verification', () => {
    it('male BMR = 10*weight + 6.25*height - 5*age + 5', () => {
      const result = calculate(BASE_METRIC_MALE);
      const expectedBMR = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
      // = 800 + 1125 - 150 + 5 = 1780
      expectWithinTolerance(
        result.bmr as number,
        expectedBMR,
        1,
        'male BMR'
      );
    });

    it('female BMR = 10*weight + 6.25*height - 5*age - 161', () => {
      const result = calculate(BASE_METRIC_FEMALE);
      const expectedBMR = 10 * 65 + 6.25 * 165 - 5 * 30 - 161;
      // = 650 + 1031.25 - 150 - 161 = 1370.25
      expectWithinTolerance(
        result.bmr as number,
        expectedBMR,
        1,
        'female BMR'
      );
    });

    it('male BMR > female BMR for comparable stats', () => {
      const male = calculate({ ...BASE_METRIC_MALE, weight: 70, height: 170 });
      const female = calculate({ ...BASE_METRIC_FEMALE, weight: 70, height: 170 });
      expect(male.bmr as number).toBeGreaterThan(female.bmr as number);
    });
  });

  // ─── Activity Multipliers ─────────────────────────────────────────────────

  describe('Activity level multipliers', () => {
    const MULTIPLIERS: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      veryActive: 1.9,
    };

    it('TDEE = BMR * activity multiplier for each level', () => {
      const bmrResult = calculate({
        ...BASE_METRIC_MALE,
        activityLevel: 'sedentary',
      });
      const bmr = bmrResult.bmr as number;

      for (const [level, multiplier] of Object.entries(MULTIPLIERS)) {
        const result = calculate({
          ...BASE_METRIC_MALE,
          activityLevel: level,
        });
        expectWithinTolerance(
          result.tdee as number,
          bmr * multiplier,
          2,
          `TDEE at ${level}`
        );
      }
    });

    it('activity levels produce monotonically increasing TDEE', () => {
      const levels = ['sedentary', 'light', 'moderate', 'active', 'veryActive'];
      const results = levels.map((level) =>
        calculate({ ...BASE_METRIC_MALE, activityLevel: level })
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].tdee as number).toBeGreaterThan(
          results[i - 1].tdee as number
        );
      }
    });

    it('tdeeByActivity contains all 5 levels', () => {
      const result = calculate(BASE_METRIC_MALE);
      const byActivity = result.tdeeByActivity as Record<string, number>;
      expect(typeof byActivity).toBe('object');
      const values = Object.values(byActivity);
      expect(values.length).toBeGreaterThanOrEqual(5);
      // All should be positive
      for (const v of values) {
        expect(v).toBeGreaterThan(0);
      }
    });
  });

  // ─── Goal-Based Adjustments ────────────────────────────────────────────────

  describe('Goal-based calorie adjustments', () => {
    it('lose = TDEE - 500', () => {
      const maintain = calculate({ ...BASE_METRIC_MALE, goal: 'maintain' });
      const lose = calculate({ ...BASE_METRIC_MALE, goal: 'lose' });
      expectWithinTolerance(
        lose.targetCalories as number,
        (maintain.tdee as number) - 500,
        1,
        'lose target'
      );
    });

    it('gain = TDEE + 500', () => {
      const maintain = calculate({ ...BASE_METRIC_MALE, goal: 'maintain' });
      const gain = calculate({ ...BASE_METRIC_MALE, goal: 'gain' });
      expectWithinTolerance(
        gain.targetCalories as number,
        (maintain.tdee as number) + 500,
        1,
        'gain target'
      );
    });

    it('maintain = TDEE exactly', () => {
      const result = calculate(BASE_METRIC_MALE);
      expectWithinTolerance(
        result.targetCalories as number,
        result.tdee as number,
        1,
        'maintain target'
      );
    });

    it('lose target < maintain target < gain target', () => {
      const lose = calculate({ ...BASE_METRIC_MALE, goal: 'lose' });
      const maintain = calculate({ ...BASE_METRIC_MALE, goal: 'maintain' });
      const gain = calculate({ ...BASE_METRIC_MALE, goal: 'gain' });
      expect(lose.targetCalories as number).toBeLessThan(
        maintain.targetCalories as number
      );
      expect(maintain.targetCalories as number).toBeLessThan(
        gain.targetCalories as number
      );
    });
  });

  // ─── Macro Split Verification ──────────────────────────────────────────────

  describe('Macro calorie consistency', () => {
    const goals = ['lose', 'maintain', 'gain'] as const;

    goals.forEach((goal) => {
      it(`${goal}: macro calories sum to target calories`, () => {
        const result = calculate({ ...BASE_METRIC_MALE, goal });
        const macros = result.macros as {
          protein: { calories: number };
          carbs: { calories: number };
          fat: { calories: number };
        };
        const target = result.targetCalories as number;
        const macroSum =
          macros.protein.calories + macros.carbs.calories + macros.fat.calories;
        // Allow rounding tolerance of ±5 calories
        expectWithinTolerance(macroSum, target, 5, `${goal} macro sum`);
      });
    });

    goals.forEach((goal) => {
      it(`${goal}: macro percentages sum to ~100%`, () => {
        const result = calculate({ ...BASE_METRIC_MALE, goal });
        const macros = result.macros as {
          protein: { percentage: number };
          carbs: { percentage: number };
          fat: { percentage: number };
        };
        const pctSum =
          macros.protein.percentage +
          macros.carbs.percentage +
          macros.fat.percentage;
        expectWithinTolerance(pctSum, 100, 2, `${goal} pct sum`);
      });
    });

    it('protein grams * 4 = protein calories', () => {
      const result = calculate(BASE_METRIC_MALE);
      const macros = result.macros as {
        protein: { grams: number; calories: number };
      };
      expectWithinTolerance(
        macros.protein.grams * 4,
        macros.protein.calories,
        2,
        'protein cal/gram'
      );
    });

    it('carbs grams * 4 = carbs calories', () => {
      const result = calculate(BASE_METRIC_MALE);
      const macros = result.macros as {
        carbs: { grams: number; calories: number };
      };
      expectWithinTolerance(
        macros.carbs.grams * 4,
        macros.carbs.calories,
        2,
        'carbs cal/gram'
      );
    });

    it('fat grams * 9 = fat calories', () => {
      const result = calculate(BASE_METRIC_MALE);
      const macros = result.macros as {
        fat: { grams: number; calories: number };
      };
      expectWithinTolerance(
        macros.fat.grams * 9,
        macros.fat.calories,
        2,
        'fat cal/gram'
      );
    });
  });

  // ─── Imperial ↔ Metric Consistency ─────────────────────────────────────────

  describe('Imperial ↔ metric consistency', () => {
    it('same person in metric vs imperial → similar BMR', () => {
      const metric = calculate(BASE_METRIC_MALE);
      const imperial = calculate(BASE_IMPERIAL_MALE);
      // Allow ±5 calorie tolerance due to conversion rounding
      expectWithinTolerance(
        imperial.bmr as number,
        metric.bmr as number,
        5,
        'cross-system BMR'
      );
    });

    it('same person → similar TDEE', () => {
      const metric = calculate(BASE_METRIC_MALE);
      const imperial = calculate(BASE_IMPERIAL_MALE);
      expectWithinTolerance(
        imperial.tdee as number,
        metric.tdee as number,
        10,
        'cross-system TDEE'
      );
    });
  });

  // ─── Monotonicity Invariants ──────────────────────────────────────────────

  describe('Monotonicity invariants', () => {
    it('heavier person → higher BMR', () => {
      const results = sweepInput(
        calculate,
        BASE_METRIC_MALE,
        'weight',
        [50, 60, 70, 80, 90, 100, 120]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.bmr as number).toBeGreaterThan(
          results[i - 1].result.bmr as number
        );
      }
    });

    it('taller person → higher BMR', () => {
      const results = sweepInput(
        calculate,
        BASE_METRIC_MALE,
        'height',
        [150, 160, 170, 180, 190, 200]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.bmr as number).toBeGreaterThan(
          results[i - 1].result.bmr as number
        );
      }
    });

    it('older person → lower BMR', () => {
      const results = sweepInput(
        calculate,
        BASE_METRIC_MALE,
        'age',
        [20, 30, 40, 50, 60, 70]
      );
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.bmr as number).toBeLessThan(
          results[i - 1].result.bmr as number
        );
      }
    });
  });

  // ─── Edge Cases ────────────────────────────────────────────────────────────

  describe('Edge cases', () => {
    it('very young (18yo) — produces valid output', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_METRIC_MALE,
        age: 18,
      });
      expect(result.bmr as number).toBeGreaterThan(1000);
    });

    it('elderly (80yo) — produces valid output', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_METRIC_MALE,
        age: 80,
      });
      expect(result.bmr as number).toBeGreaterThan(500);
      expect(result.bmr as number).toBeLessThan(2000);
    });

    it('very light person (40kg) — valid output', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_METRIC_MALE,
        weight: 40,
      });
      expect(result.bmr as number).toBeGreaterThan(0);
    });

    it('very heavy person (200kg) — valid output', () => {
      const result = expectNoThrow(calculate, {
        ...BASE_METRIC_MALE,
        weight: 200,
      });
      expect(result.bmr as number).toBeGreaterThan(0);
      expect(isFinite(result.bmr as number)).toBe(true);
    });
  });

  // ─── Invalid Input Robustness ──────────────────────────────────────────────

  describe('Invalid input robustness', () => {
    it('handles invalid age values', () => {
      testInvalidInputs(calculate, BASE_METRIC_MALE, 'age');
    });

    it('handles invalid weight values', () => {
      testInvalidInputs(calculate, BASE_METRIC_MALE, 'weight');
    });

    it('handles invalid height values', () => {
      testInvalidInputs(calculate, BASE_METRIC_MALE, 'height');
    });

    it('handles invalid sex values', () => {
      testInvalidInputs(calculate, BASE_METRIC_MALE, 'sex');
    });

    it('handles missing input keys', () => {
      testMissingInputs(calculate, BASE_METRIC_MALE, [
        'age',
        'sex',
        'weight',
        'height',
        'unitSystem',
        'activityLevel',
        'goal',
      ]);
    });
  });
});
