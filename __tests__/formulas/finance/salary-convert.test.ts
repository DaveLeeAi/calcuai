import { calculateSalary } from '@/lib/formulas/finance/salary-convert';

describe('calculateSalary', () => {
  // ─── Test 1: Standard $50k annual salary breakdown ───
  it('converts $50,000 annual salary to all frequencies', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 50000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    expect(result.annualSalary).toBe(50000);
    expect(result.monthlySalary).toBeCloseTo(4166.67, 2);
    expect(result.biweeklySalary).toBeCloseTo(1923.08, 2);
    expect(result.weeklySalary).toBeCloseTo(961.54, 2);
    expect(result.hourlyRate).toBe(24.04);
  });

  // ─── Test 2: Hourly to annual conversion — $20/hr ───
  it('converts $20/hour to annual salary', () => {
    const result = calculateSalary({
      inputMode: 'hourly',
      hourlyRate: 20,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    // $20 × 40 × 52 = $41,600
    expect(result.annualSalary).toBe(41600);
    expect(result.hourlyRate).toBe(20);
  });

  // ─── Test 3: $15/hour (federal minimum example) ───
  it('converts $15/hour to correct annual salary', () => {
    const result = calculateSalary({
      inputMode: 'hourly',
      hourlyRate: 15,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    // $15 × 40 × 52 = $31,200
    expect(result.annualSalary).toBe(31200);
    expect(result.monthlySalary).toBe(2600);
  });

  // ─── Test 4: $100k annual to hourly ───
  it('converts $100,000 annual to hourly rate', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 100000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    // $100,000 / (40 × 52) = $48.08/hr
    expect(result.hourlyRate).toBeCloseTo(48.08, 2);
  });

  // ─── Test 5: With vacation days (annual mode — salary stays same) ───
  it('annual mode: salary unchanged with PTO, adjusted hourly increases', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 10,
      holidays: 10,
    });
    // Annual stays $52,000 for salaried employees
    expect(result.annualSalary).toBe(52000);
    // Working days: 260 - 20 = 240
    expect(result.totalWorkingDays).toBe(240);
    // Adjusted hourly = 52000 / (240 × 8) = $27.08
    expect(result.adjustedHourly).toBeCloseTo(27.08, 2);
  });

  // ─── Test 6: With vacation days (hourly mode — reduces total pay) ───
  it('hourly mode: adjusted annual decreases with PTO', () => {
    const result = calculateSalary({
      inputMode: 'hourly',
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 10,
      holidays: 10,
    });
    // Unadjusted: $25 × 40 × 52 = $52,000
    expect(result.annualSalary).toBe(52000);
    // Working days: 260 - 20 = 240, hours = 240 × 8 = 1920
    // Adjusted annual: $25 × 1920 = $48,000
    expect(result.adjustedAnnual).toBe(48000);
  });

  // ─── Test 7: Part-time (20 hours/week) ───
  it('handles part-time 20 hours/week correctly', () => {
    const result = calculateSalary({
      inputMode: 'hourly',
      hourlyRate: 20,
      hoursPerWeek: 20,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    // $20 × 20 × 52 = $20,800
    expect(result.annualSalary).toBe(20800);
  });

  // ─── Test 8: Daily salary ───
  it('calculates daily salary correctly', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    // Daily = 52000 / 260 = $200/day
    expect(result.dailySalary).toBe(200);
  });

  // ─── Test 9: Biweekly salary ───
  it('calculates biweekly salary correctly', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 78000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    // Biweekly = 78000 / 26 = $3,000
    expect(result.biweeklySalary).toBe(3000);
  });

  // ─── Test 10: Salary breakdown table has correct frequencies ───
  it('returns salary breakdown with all frequency labels', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 60000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    const breakdown = result.salaryBreakdown as { frequency: string; unadjusted: number; adjusted: number }[];
    const frequencies = breakdown.map((r) => r.frequency);
    expect(frequencies).toContain('Annual');
    expect(frequencies).toContain('Monthly');
    expect(frequencies).toContain('Biweekly');
    expect(frequencies).toContain('Weekly');
    expect(frequencies).toContain('Daily');
    expect(frequencies).toContain('Hourly');
  });

  // ─── Test 11: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 60000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Annual Salary');
    expect(labels).toContain('Monthly');
    expect(labels).toContain('Hourly');
    expect(labels).toContain('Working Days/Year');
  });

  // ─── Test 12: Zero salary ───
  it('handles zero salary gracefully', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 0,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    expect(result.annualSalary).toBe(0);
    expect(result.hourlyRate).toBe(0);
    expect(result.monthlySalary).toBe(0);
  });

  // ─── Test 13: Missing inputs use defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateSalary({});
    expect(result.annualSalary).toBe(0);
    expect(result.hourlyRate).toBe(0);
  });

  // ─── Test 14: High salary ($200k) ───
  it('handles high salary correctly', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 200000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 0,
      holidays: 0,
    });
    expect(result.hourlyRate).toBeCloseTo(96.15, 2);
    expect(result.monthlySalary).toBeCloseTo(16666.67, 2);
  });

  // ─── Test 15: Working hours calculation with PTO ───
  it('calculates total working hours correctly with PTO', () => {
    const result = calculateSalary({
      inputMode: 'annual',
      annualSalary: 60000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      vacationDays: 15,
      holidays: 11,
    });
    // 260 - 26 = 234 working days, 234 × 8 = 1872 hours
    expect(result.totalWorkingDays).toBe(234);
    expect(result.totalWorkingHours).toBe(1872);
  });
});
