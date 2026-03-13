import { calculateSalaryToHourly } from '@/lib/formulas/business/salary-to-hourly';

describe('calculateSalaryToHourly', () => {
  // ─── Test 1: Standard conversion ($52,000/yr, 40hr/wk, 52wk = $25/hr) ───
  it('converts standard $52,000 salary to $25/hr', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 52000 / (40 × 52) = 52000 / 2080 = $25.00
    expect(result.hourlyRate).toBe(25);
    expect(result.adjustedHourlyRate).toBe(25);
  });

  // ─── Test 2: High salary ($150,000) ───
  it('converts $150,000 salary correctly', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 150000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 150000 / 2080 = $72.115... → $72.12
    expect(result.hourlyRate).toBe(72.12);
  });

  // ─── Test 3: Minimum wage equivalent ($15,080) ───
  it('converts minimum wage salary ($15,080) correctly', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 15080,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 15080 / 2080 = $7.25
    expect(result.hourlyRate).toBe(7.25);
  });

  // ─── Test 4: With paid holidays (10 days) ───
  it('calculates adjusted rate with 10 paid holidays', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 10,
      paidVacationDays: 0,
    });
    // Base: $25/hr
    // Adjusted weeks: 52 - (10 / 5) = 52 - 2 = 50
    // Adjusted hours: 40 × 50 = 2000
    // Adjusted rate: 52000 / 2000 = $26.00
    expect(result.hourlyRate).toBe(25);
    expect(result.adjustedHourlyRate).toBe(26);
    expect(result.adjustedWorkHours).toBe(2000);
  });

  // ─── Test 5: With paid vacation (15 days) ───
  it('calculates adjusted rate with 15 vacation days', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 15,
    });
    // Adjusted weeks: 52 - (15 / 5) = 52 - 3 = 49
    // Adjusted hours: 40 × 49 = 1960
    // Adjusted rate: 52000 / 1960 = $26.530612... → $26.53
    expect(result.adjustedHourlyRate).toBe(26.53);
    expect(result.adjustedWorkHours).toBe(1960);
  });

  // ─── Test 6: With both holidays + vacation ───
  it('calculates adjusted rate with 10 holidays + 10 vacation days', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 10,
      paidVacationDays: 10,
    });
    // Adjusted weeks: 52 - (20 / 5) = 52 - 4 = 48
    // Adjusted hours: 40 × 48 = 1920
    // Adjusted rate: 52000 / 1920 = $27.083... → $27.08
    expect(result.adjustedHourlyRate).toBe(27.08);
    expect(result.adjustedWorkHours).toBe(1920);
  });

  // ─── Test 7: Part-time (20 hrs/wk) ───
  it('calculates part-time hourly rate correctly', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 26000,
      hoursPerWeek: 20,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 26000 / (20 × 52) = 26000 / 1040 = $25.00
    expect(result.hourlyRate).toBe(25);
    expect(result.totalWorkHours).toBe(1040);
  });

  // ─── Test 8: Zero salary ───
  it('handles zero salary gracefully', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 0,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    expect(result.hourlyRate).toBe(0);
    expect(result.adjustedHourlyRate).toBe(0);
    expect(result.monthlyPay).toBe(0);
    expect(result.biweeklyPay).toBe(0);
    expect(result.weeklyPay).toBe(0);
    expect(result.dailyPay).toBe(0);
  });

  // ─── Test 9: Monthly/biweekly/weekly/daily breakdown ───
  it('calculates all pay period breakdowns correctly', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // Monthly: 52000 / 12 = $4,333.33
    expect(result.monthlyPay).toBe(4333.33);
    // Biweekly: 52000 / 26 = $2,000.00
    expect(result.biweeklyPay).toBe(2000);
    // Weekly: 52000 / 52 = $1,000.00
    expect(result.weeklyPay).toBe(1000);
    // Daily: 1000 / 5 = $200.00
    expect(result.dailyPay).toBe(200);
  });

  // ─── Test 10: Non-standard weeks (48 weeks) ───
  it('handles non-standard weeks per year', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 48000,
      hoursPerWeek: 40,
      weeksPerYear: 48,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 48000 / (40 × 48) = 48000 / 1920 = $25.00
    expect(result.hourlyRate).toBe(25);
    expect(result.totalWorkHours).toBe(1920);
  });

  // ─── Test 11: Total work hours calculation ───
  it('calculates total work hours correctly', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 40 × 52 = 2080
    expect(result.totalWorkHours).toBe(2080);
  });

  // ─── Test 12: Adjusted vs base hourly rate ───
  it('adjusted rate is always >= base rate when PTO is present', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 60000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 10,
      paidVacationDays: 15,
    });
    // Base: 60000 / 2080 = $28.85
    // Adjusted weeks: 52 - (25 / 5) = 52 - 5 = 47
    // Adjusted hours: 40 × 47 = 1880
    // Adjusted: 60000 / 1880 = $31.91
    expect(result.hourlyRate).toBe(28.85);
    expect(result.adjustedHourlyRate).toBe(31.91);
    expect(Number(result.adjustedHourlyRate)).toBeGreaterThan(Number(result.hourlyRate));
  });

  // ─── Test 13: Very high salary ($1,000,000) ───
  it('handles very high salary ($1M) correctly', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 1000000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    // 1000000 / 2080 = $480.769... → $480.77
    expect(result.hourlyRate).toBe(480.77);
  });

  // ─── Test 14: Output structure validation ───
  it('returns all expected output keys', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    expect(result).toHaveProperty('hourlyRate');
    expect(result).toHaveProperty('adjustedHourlyRate');
    expect(result).toHaveProperty('monthlyPay');
    expect(result).toHaveProperty('biweeklyPay');
    expect(result).toHaveProperty('weeklyPay');
    expect(result).toHaveProperty('dailyPay');
    expect(result).toHaveProperty('totalWorkHours');
    expect(result).toHaveProperty('adjustedWorkHours');
    expect(result).toHaveProperty('payBreakdown');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 15: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Hourly Rate');
    expect(labels).toContain('Adjusted Hourly Rate');
    expect(labels).toContain('Daily Pay');
    expect(labels).toContain('Weekly Pay');
    expect(labels).toContain('Biweekly Pay');
    expect(labels).toContain('Monthly Pay');
    expect(labels).toContain('Total Work Hours/Year');
    expect(labels).toContain('Adjusted Work Hours/Year');
  });

  // ─── Test 16: Zero hours per week (avoid divide by zero) ───
  it('handles zero hours per week without dividing by zero', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 0,
      weeksPerYear: 52,
      paidHolidays: 0,
      paidVacationDays: 0,
    });
    expect(result.hourlyRate).toBe(0);
    expect(result.adjustedHourlyRate).toBe(0);
    expect(result.totalWorkHours).toBe(0);
  });

  // ─── Test 17: Missing inputs use safe defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateSalaryToHourly({});
    expect(result.hourlyRate).toBe(0);
    expect(result.adjustedHourlyRate).toBe(0);
    expect(result.monthlyPay).toBe(0);
    expect(result.weeklyPay).toBe(0);
    expect(result.totalWorkHours).toBe(0);
  });

  // ─── Test 18: PTO exceeds weeks per year (edge case) ───
  it('handles PTO exceeding work weeks gracefully', () => {
    const result = calculateSalaryToHourly({
      annualSalary: 52000,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      paidHolidays: 30,
      paidVacationDays: 60,
    });
    // PTO weeks: (30 + 60) / 5 = 18
    // Adjusted weeks: max(0, 52 - 18) = 34
    // Adjusted hours: 40 × 34 = 1360
    // Adjusted rate: 52000 / 1360 = $38.235... → $38.24
    expect(result.adjustedWorkHours).toBe(1360);
    expect(result.adjustedHourlyRate).toBe(38.24);
  });
});
