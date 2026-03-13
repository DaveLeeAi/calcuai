import { calculateWaterIntake } from '@/lib/formulas/health/water-intake';

describe('calculateWaterIntake', () => {
  // === STANDARD CASES ===

  it('calculates for 160 lbs, moderate activity, temperate climate', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.24, adjustment = 0
    // total = 80 * 1.24 + 0 = 99.2 → rounded to 99
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(99);
  });

  it('calculates for sedentary activity', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.0, adjustment = 0
    // total = 80 * 1.0 + 0 = 80
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'sedentary',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(80);
  });

  it('calculates for very active activity', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.36, adjustment = 0
    // total = 80 * 1.36 = 108.8 → rounded to 109
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'active',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(109);
  });

  it('calculates for extremely active activity', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.5, adjustment = 0
    // total = 80 * 1.5 = 120
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'extreme',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(120);
  });

  it('calculates for lightly active activity', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.12, adjustment = 0
    // total = 80 * 1.12 = 89.6 → rounded to 90
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'light',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(90);
  });

  // === CLIMATE ADJUSTMENTS ===

  it('adds 16 oz for hot climate', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.24, adjustment = +16
    // total = 80 * 1.24 + 16 = 99.2 + 16 = 115.2 → rounded to 115
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'hot',
    });
    expect(result.dailyOunces).toBe(115);
  });

  it('subtracts 4 oz for cold climate', () => {
    // base = 160 * 0.5 = 80, multiplier = 1.24, adjustment = -4
    // total = 80 * 1.24 - 4 = 99.2 - 4 = 95.2 → rounded to 95
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'cold',
    });
    expect(result.dailyOunces).toBe(95);
  });

  // === PREGNANCY & BREASTFEEDING ===

  it('adds 10 oz for pregnancy', () => {
    // base = 80 * 1.24 + 0 = 99.2 + 10 = 109.2 → rounded to 109
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
      pregnant: true,
    });
    expect(result.dailyOunces).toBe(109);
  });

  it('adds 32 oz for breastfeeding', () => {
    // base = 80 * 1.24 + 0 = 99.2 + 32 = 131.2 → rounded to 131
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
      breastfeeding: true,
    });
    expect(result.dailyOunces).toBe(131);
  });

  // === WEIGHT VARIATIONS ===

  it('calculates for lightweight person (120 lbs, sedentary)', () => {
    // base = 120 * 0.5 = 60, multiplier = 1.0, adjustment = 0
    // total = 60
    const result = calculateWaterIntake({
      weight: 120,
      activityLevel: 'sedentary',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(60);
  });

  it('calculates for heavy person (250 lbs, moderate)', () => {
    // base = 250 * 0.5 = 125, multiplier = 1.24, adjustment = 0
    // total = 125 * 1.24 = 155 → rounded to 155
    const result = calculateWaterIntake({
      weight: 250,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(155);
  });

  // === UNIT CONVERSIONS ===

  it('correctly converts ounces to liters', () => {
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    // 99 oz * 0.0295735 = 2.927... → 2.9 L
    expect(result.dailyLiters).toBeCloseTo(99 * 0.0295735, 1);
  });

  it('correctly converts ounces to 8-oz cups', () => {
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    // 99 / 8 = 12.375 → rounded to 12
    expect(result.dailyCups).toBe(Math.round(99 / 8));
  });

  it('correctly converts ounces to 16.9-oz bottles', () => {
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    // 99 / 16.9 = 5.857... → 5.9
    expect(result.dailyBottles).toBeCloseTo(99 / 16.9, 1);
  });

  // === EDGE CASES ===

  it('returns all zeros for zero weight', () => {
    const result = calculateWaterIntake({
      weight: 0,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    expect(result.dailyOunces).toBe(0);
    expect(result.dailyLiters).toBe(0);
    expect(result.dailyCups).toBe(0);
    expect(result.dailyBottles).toBe(0);
    expect(result.summary).toEqual([]);
  });

  it('returns a summary with correct labels', () => {
    const result = calculateWaterIntake({
      weight: 160,
      activityLevel: 'moderate',
      climate: 'temperate',
    });
    expect(result.summary.length).toBe(7);
    expect(result.summary[0].label).toBe('Daily Water Intake');
    expect(result.summary[4].label).toBe('Body Weight');
    expect(result.summary[5].label).toBe('Activity Level');
    expect(result.summary[6].label).toBe('Climate');
  });
});
