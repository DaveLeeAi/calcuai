import { calculateRaisePercentage } from '@/lib/formulas/business/raise-percentage';

describe('calculateRaisePercentage', () => {
  // ─── Test 1: Standard 5% raise on $50,000 ───
  it('calculates a 5% raise on $50,000 salary', () => {
    const result = calculateRaisePercentage({
      currentSalary: 50000,
      raisePercentage: 5,
      payFrequency: 'annual',
    });
    // New salary: $50,000 × 1.05 = $52,500
    // Raise: $2,500
    expect(result.newSalary).toBe(52500);
    expect(result.raiseAmount).toBe(2500);
  });

  // ─── Test 2: 10% raise ───
  it('calculates a 10% raise on $60,000 salary', () => {
    const result = calculateRaisePercentage({
      currentSalary: 60000,
      raisePercentage: 10,
      payFrequency: 'annual',
    });
    expect(result.newSalary).toBe(66000);
    expect(result.raiseAmount).toBe(6000);
  });

  // ─── Test 3: 3% cost-of-living raise on $65,000 ───
  it('calculates a 3% COLA raise on $65,000', () => {
    const result = calculateRaisePercentage({
      currentSalary: 65000,
      raisePercentage: 3,
      payFrequency: 'annual',
    });
    // $65,000 × 1.03 = $66,950
    expect(result.newSalary).toBe(66950);
    expect(result.raiseAmount).toBe(1950);
  });

  // ─── Test 4: 0% raise ───
  it('handles 0% raise correctly', () => {
    const result = calculateRaisePercentage({
      currentSalary: 50000,
      raisePercentage: 0,
      payFrequency: 'annual',
    });
    expect(result.newSalary).toBe(50000);
    expect(result.raiseAmount).toBe(0);
    expect(result.monthlyDifference).toBe(0);
    expect(result.biweeklyDifference).toBe(0);
  });

  // ─── Test 5: High salary ($250,000) ───
  it('calculates raise on a high salary', () => {
    const result = calculateRaisePercentage({
      currentSalary: 250000,
      raisePercentage: 8,
      payFrequency: 'annual',
    });
    // $250,000 × 1.08 = $270,000
    expect(result.newSalary).toBe(270000);
    expect(result.raiseAmount).toBe(20000);
  });

  // ─── Test 6: Minimum wage hourly input ───
  it('converts hourly input to annual correctly', () => {
    const result = calculateRaisePercentage({
      currentSalary: 15,
      raisePercentage: 5,
      payFrequency: 'hourly',
    });
    // Annual: $15 × 2080 = $31,200
    // New: $31,200 × 1.05 = $32,760
    expect(result.newSalary).toBe(32760);
    expect(result.raiseAmount).toBe(1560);
  });

  // ─── Test 7: Large raise (50%) ───
  it('calculates a large 50% raise', () => {
    const result = calculateRaisePercentage({
      currentSalary: 40000,
      raisePercentage: 50,
      payFrequency: 'annual',
    });
    expect(result.newSalary).toBe(60000);
    expect(result.raiseAmount).toBe(20000);
  });

  // ─── Test 8: Monthly input conversion ───
  it('converts monthly salary input to annual', () => {
    const result = calculateRaisePercentage({
      currentSalary: 5000,
      raisePercentage: 10,
      payFrequency: 'monthly',
    });
    // Annual: $5,000 × 12 = $60,000
    // New: $60,000 × 1.10 = $66,000
    expect(result.newSalary).toBe(66000);
    expect(result.raiseAmount).toBe(6000);
  });

  // ─── Test 9: Biweekly input conversion ───
  it('converts biweekly salary input to annual', () => {
    const result = calculateRaisePercentage({
      currentSalary: 2000,
      raisePercentage: 5,
      payFrequency: 'biweekly',
    });
    // Annual: $2,000 × 26 = $52,000
    // New: $52,000 × 1.05 = $54,600
    expect(result.newSalary).toBe(54600);
    expect(result.raiseAmount).toBe(2600);
  });

  // ─── Test 10: Weekly input conversion ───
  it('converts weekly salary input to annual', () => {
    const result = calculateRaisePercentage({
      currentSalary: 1000,
      raisePercentage: 4,
      payFrequency: 'weekly',
    });
    // Annual: $1,000 × 52 = $52,000
    // New: $52,000 × 1.04 = $54,080
    expect(result.newSalary).toBe(54080);
    expect(result.raiseAmount).toBe(2080);
  });

  // ─── Test 11: All breakdowns match expected values ───
  it('calculates all pay period breakdowns correctly', () => {
    const result = calculateRaisePercentage({
      currentSalary: 52000,
      raisePercentage: 5,
      payFrequency: 'annual',
    });
    // New salary: $54,600
    expect(result.newSalary).toBe(54600);
    expect(result.newMonthly).toBe(4550);
    expect(result.newBiweekly).toBe(2100);
    expect(result.newWeekly).toBe(1050);
    expect(result.newHourly).toBe(26.25);

    // Old breakdowns
    expect(result.oldMonthly).toBeCloseTo(4333.33, 2);
    expect(result.oldBiweekly).toBe(2000);
    expect(result.oldWeekly).toBe(1000);
    expect(result.oldHourly).toBe(25);
  });

  // ─── Test 12: Difference calculations ───
  it('calculates monthly and biweekly differences', () => {
    const result = calculateRaisePercentage({
      currentSalary: 50000,
      raisePercentage: 5,
      payFrequency: 'annual',
    });
    // Old monthly: 50000/12 = 4166.67
    // New monthly: 52500/12 = 4375
    // Diff: ~208.33
    expect(result.monthlyDifference).toBeCloseTo(208.33, 1);
    // Old biweekly: 50000/26 = 1923.08
    // New biweekly: 52500/26 = 2019.23
    // Diff: ~96.15
    expect(result.biweeklyDifference).toBeCloseTo(96.15, 1);
  });

  // ─── Test 13: Zero salary ───
  it('handles zero salary gracefully', () => {
    const result = calculateRaisePercentage({
      currentSalary: 0,
      raisePercentage: 10,
      payFrequency: 'annual',
    });
    expect(result.newSalary).toBe(0);
    expect(result.raiseAmount).toBe(0);
    expect(result.newMonthly).toBe(0);
    expect(result.monthlyDifference).toBe(0);
  });

  // ─── Test 14: Output structure validation ───
  it('returns all expected output fields', () => {
    const result = calculateRaisePercentage({
      currentSalary: 50000,
      raisePercentage: 5,
      payFrequency: 'annual',
    });
    expect(result).toHaveProperty('newSalary');
    expect(result).toHaveProperty('raiseAmount');
    expect(result).toHaveProperty('newMonthly');
    expect(result).toHaveProperty('newBiweekly');
    expect(result).toHaveProperty('newWeekly');
    expect(result).toHaveProperty('newHourly');
    expect(result).toHaveProperty('oldMonthly');
    expect(result).toHaveProperty('oldBiweekly');
    expect(result).toHaveProperty('oldWeekly');
    expect(result).toHaveProperty('oldHourly');
    expect(result).toHaveProperty('monthlyDifference');
    expect(result).toHaveProperty('biweeklyDifference');
    expect(result).toHaveProperty('summary');
    expect(Array.isArray(result.summary)).toBe(true);
  });

  // ─── Test 15: Raise percentage capped at 200% ───
  it('caps raise percentage at 200%', () => {
    const result = calculateRaisePercentage({
      currentSalary: 50000,
      raisePercentage: 300,
      payFrequency: 'annual',
    });
    // Should be capped to 200%: $50,000 × 3.0 = $150,000
    expect(result.newSalary).toBe(150000);
    expect(result.raiseAmount).toBe(100000);
  });

  // ─── Test 16: Summary includes correct labels ───
  it('summary contains expected label/value pairs', () => {
    const result = calculateRaisePercentage({
      currentSalary: 50000,
      raisePercentage: 5,
      payFrequency: 'annual',
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('New Annual Salary');
    expect(labels).toContain('Raise Amount');
    expect(labels).toContain('New Monthly Pay');
    expect(labels).toContain('Monthly Increase');
  });
});
