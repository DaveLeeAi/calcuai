import { calculateHourlyToSalary } from '@/lib/formulas/business/hourly-to-salary';

describe('calculateHourlyToSalary', () => {
  // ─── Test 1: Standard conversion ($25/hr, 40hr/wk, 52wk) ───
  it('calculates standard full-time salary ($25/hr = $52,000/year)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    expect(result.annualSalary).toBe(52000);
    expect(result.totalWithOvertime).toBe(52000);
  });

  // ─── Test 2: Part-time (20 hrs/wk) ───
  it('calculates part-time salary (20 hrs/wk)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 20,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $25 × 20 × 52 = $26,000
    expect(result.annualSalary).toBe(26000);
  });

  // ─── Test 3: With overtime (5 OT hours at 1.5x) ───
  it('calculates salary with overtime at 1.5x', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 5,
      overtimeMultiplier: '1.5',
    });
    // Base: $25 × 40 × 52 = $52,000
    // OT: $25 × 1.5 × 5 × 52 = $9,750
    // Total: $61,750
    expect(result.annualSalary).toBe(52000);
    expect(result.overtimePay).toBe(9750);
    expect(result.totalWithOvertime).toBe(61750);
  });

  // ─── Test 4: With overtime at 2x ───
  it('calculates salary with overtime at 2x', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 5,
      overtimeMultiplier: '2',
    });
    // Base: $52,000
    // OT: $25 × 2 × 5 × 52 = $13,000
    // Total: $65,000
    expect(result.overtimePay).toBe(13000);
    expect(result.totalWithOvertime).toBe(65000);
  });

  // ─── Test 5: High hourly rate ($150/hr) ───
  it('calculates salary for high hourly rate ($150/hr)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 150,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $150 × 40 × 52 = $312,000
    expect(result.annualSalary).toBe(312000);
  });

  // ─── Test 6: Minimum wage ($7.25/hr) ───
  it('calculates salary for minimum wage ($7.25/hr)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 7.25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $7.25 × 40 × 52 = $15,080
    expect(result.annualSalary).toBe(15080);
  });

  // ─── Test 7: Zero hours (should return 0) ───
  it('returns zero for zero hours per week', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 0,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    expect(result.annualSalary).toBe(0);
    expect(result.monthlyPay).toBe(0);
    expect(result.weeklyPay).toBe(0);
    expect(result.dailyPay).toBe(0);
    expect(result.effectiveHourlyRate).toBe(0);
  });

  // ─── Test 8: Zero rate (should return 0) ───
  it('returns zero for zero hourly rate', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 0,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 5,
      overtimeMultiplier: '1.5',
    });
    expect(result.annualSalary).toBe(0);
    expect(result.overtimePay).toBe(0);
    expect(result.totalWithOvertime).toBe(0);
    expect(result.effectiveHourlyRate).toBe(0);
  });

  // ─── Test 9: Non-standard weeks (48 weeks — 4 weeks vacation) ───
  it('calculates salary with reduced weeks (48 weeks)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 48,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $25 × 40 × 48 = $48,000
    expect(result.annualSalary).toBe(48000);
  });

  // ─── Test 10: Monthly pay breakdown ───
  it('calculates monthly pay correctly', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $52,000 / 12 = $4,333.33
    expect(result.monthlyPay).toBeCloseTo(4333.33, 2);
  });

  // ─── Test 11: Biweekly and weekly pay breakdown ───
  it('calculates biweekly and weekly pay correctly', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // Biweekly: $52,000 / 26 = $2,000
    expect(result.biweeklyPay).toBe(2000);
    // Weekly: $52,000 / 52 = $1,000
    expect(result.weeklyPay).toBe(1000);
  });

  // ─── Test 12: Daily pay breakdown ───
  it('calculates daily pay correctly', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $52,000 / (52 × 5) = $52,000 / 260 = $200
    expect(result.dailyPay).toBe(200);
  });

  // ─── Test 13: Effective hourly rate with overtime ───
  it('calculates effective hourly rate with overtime', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 10,
      overtimeMultiplier: '1.5',
    });
    // Base: $25 × 40 × 52 = $52,000
    // OT: $25 × 1.5 × 10 × 52 = $19,500
    // Total: $71,500
    // Total hours: (40 + 10) × 52 = 2,600
    // Effective: $71,500 / 2,600 = $27.50
    expect(result.totalWithOvertime).toBe(71500);
    expect(result.effectiveHourlyRate).toBe(27.50);
  });

  // ─── Test 14: Edge case — 0 overtime hours ───
  it('handles zero overtime hours (effective rate equals hourly rate)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 30,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    expect(result.overtimePay).toBe(0);
    expect(result.effectiveHourlyRate).toBe(30);
    expect(result.annualSalary).toBe(result.totalWithOvertime);
  });

  // ─── Test 15: Large values ($500/hr, 60hrs/wk) ───
  it('handles large values ($500/hr, 60 hrs/wk)', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 500,
      hoursPerWeek: 60,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    // $500 × 60 × 52 = $1,560,000
    expect(result.annualSalary).toBe(1560000);
  });

  // ─── Test 16: Output structure validation ───
  it('returns all expected output fields', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 0,
      overtimeMultiplier: '1.5',
    });
    expect(result).toHaveProperty('annualSalary');
    expect(result).toHaveProperty('monthlyPay');
    expect(result).toHaveProperty('biweeklyPay');
    expect(result).toHaveProperty('weeklyPay');
    expect(result).toHaveProperty('dailyPay');
    expect(result).toHaveProperty('overtimePay');
    expect(result).toHaveProperty('totalWithOvertime');
    expect(result).toHaveProperty('effectiveHourlyRate');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 17: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateHourlyToSalary({
      hourlyRate: 25,
      hoursPerWeek: 40,
      weeksPerYear: 52,
      overtimeHours: 5,
      overtimeMultiplier: '1.5',
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Annual Salary');
    expect(labels).toContain('Monthly Pay');
    expect(labels).toContain('Biweekly Pay');
    expect(labels).toContain('Weekly Pay');
    expect(labels).toContain('Daily Pay');
    expect(labels).toContain('Annual Overtime Pay');
    expect(labels).toContain('Total Annual Compensation');
    expect(labels).toContain('Effective Hourly Rate');
  });

  // ─── Test 18: Missing inputs use safe defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateHourlyToSalary({});
    expect(result.annualSalary).toBe(0);
    expect(result.overtimePay).toBe(0);
    expect(result.totalWithOvertime).toBe(0);
    expect(result.effectiveHourlyRate).toBe(0);
  });
});
