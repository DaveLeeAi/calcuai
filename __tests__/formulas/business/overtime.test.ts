import { calculateOvertime } from '@/lib/formulas/business/overtime';

describe('calculateOvertime', () => {
  // ─── Test 1: Standard FLSA overtime (40 regular + 10 OT at 1.5×) ───
  it('calculates standard FLSA overtime correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Regular: 40 × $25 = $1,000
    // Overtime: 10 × $25 × 1.5 = $375
    // Total: $1,375
    expect(result.totalPay).toBe(1375);
    expect(result.regularPay).toBe(1000);
    expect(result.overtimePay).toBe(375);
  });

  // ─── Test 2: No overtime hours ───
  it('calculates pay with zero overtime hours', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 0,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    expect(result.totalPay).toBe(1000);
    expect(result.regularPay).toBe(1000);
    expect(result.overtimePay).toBe(0);
    expect(result.overtimePremium).toBe(0);
  });

  // ─── Test 3: Double time multiplier (2.0×) ───
  it('calculates double-time overtime correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 30,
      regularHours: 40,
      overtimeHours: 8,
      overtimeMultiplier: 2.0,
      weeksPerMonth: 4.33,
    });
    // Regular: 40 × $30 = $1,200
    // Overtime: 8 × $30 × 2.0 = $480
    // Total: $1,680
    expect(result.totalPay).toBe(1680);
    expect(result.overtimePay).toBe(480);
  });

  // ─── Test 4: 2.5× multiplier ───
  it('calculates 2.5× overtime multiplier correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 20,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 2.5,
      weeksPerMonth: 4.33,
    });
    // Regular: 40 × $20 = $800
    // Overtime: 10 × $20 × 2.5 = $500
    // Total: $1,300
    expect(result.totalPay).toBe(1300);
    expect(result.overtimePay).toBe(500);
  });

  // ─── Test 5: Zero hourly rate ───
  it('handles zero hourly rate gracefully', () => {
    const result = calculateOvertime({
      hourlyRate: 0,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    expect(result.totalPay).toBe(0);
    expect(result.regularPay).toBe(0);
    expect(result.overtimePay).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 6: Part-time with overtime ───
  it('calculates part-time with overtime correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 18,
      regularHours: 20,
      overtimeHours: 5,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Regular: 20 × $18 = $360
    // Overtime: 5 × $18 × 1.5 = $135
    // Total: $495
    expect(result.totalPay).toBe(495);
    expect(result.regularPay).toBe(360);
    expect(result.overtimePay).toBe(135);
  });

  // ─── Test 7: Maximum hours scenario ───
  it('handles high hour counts within limits', () => {
    const result = calculateOvertime({
      hourlyRate: 15,
      regularHours: 80,
      overtimeHours: 88,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Regular: 80 × $15 = $1,200
    // Overtime: 88 × $15 × 1.5 = $1,980
    // Total: $3,180
    expect(result.totalPay).toBe(3180);
    expect(result.regularPay).toBe(1200);
    expect(result.overtimePay).toBe(1980);
  });

  // ─── Test 8: Minimum wage rate ($7.25) ───
  it('calculates correctly at federal minimum wage', () => {
    const result = calculateOvertime({
      hourlyRate: 7.25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Regular: 40 × $7.25 = $290
    // Overtime: 10 × $7.25 × 1.5 = $108.75
    // Total: $398.75
    expect(result.regularPay).toBe(290);
    expect(result.overtimePay).toBe(108.75);
    expect(result.totalPay).toBe(398.75);
  });

  // ─── Test 9: High hourly rate ($150/hr) ───
  it('calculates correctly at high hourly rate', () => {
    const result = calculateOvertime({
      hourlyRate: 150,
      regularHours: 40,
      overtimeHours: 5,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Regular: 40 × $150 = $6,000
    // Overtime: 5 × $150 × 1.5 = $1,125
    // Total: $7,125
    expect(result.totalPay).toBe(7125);
    expect(result.regularPay).toBe(6000);
    expect(result.overtimePay).toBe(1125);
  });

  // ─── Test 10: Effective rate calculation ───
  it('calculates effective hourly rate correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Total: $1,375 / 50 hours = $27.50
    expect(result.effectiveRate).toBe(27.5);
  });

  // ─── Test 11: Monthly projection ───
  it('calculates monthly projection correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Total weekly: $1,375 × 4.33 = $5,953.75
    expect(result.monthlyProjection).toBe(5953.75);
  });

  // ─── Test 12: Overtime premium calculation ───
  it('calculates overtime premium correctly', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Premium: 10 × $25 × (1.5 - 1) = 10 × $25 × 0.5 = $125
    expect(result.overtimePremium).toBe(125);
  });

  // ─── Test 13: Pay breakdown pie chart data ───
  it('returns pay breakdown with correct segments', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    const breakdown = result.payBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toEqual({ label: 'Regular Pay', value: 1000 });
    expect(breakdown[1]).toEqual({ label: 'Overtime Pay', value: 375 });
  });

  // ─── Test 14: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateOvertime({
      hourlyRate: 25,
      regularHours: 40,
      overtimeHours: 10,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Regular Pay');
    expect(labels).toContain('Overtime Pay');
    expect(labels).toContain('Total Weekly Pay');
    expect(labels).toContain('Effective Hourly Rate');
    expect(labels).toContain('Overtime Premium');
    expect(labels).toContain('Monthly Projection');
  });

  // ─── Test 15: Missing inputs use safe defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateOvertime({});
    expect(result.totalPay).toBe(0);
    expect(result.regularPay).toBe(0);
    expect(result.overtimePay).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 16: Hours capped at maximum ───
  it('caps regular hours at 168', () => {
    const result = calculateOvertime({
      hourlyRate: 10,
      regularHours: 200,
      overtimeHours: 0,
      overtimeMultiplier: 1.5,
      weeksPerMonth: 4.33,
    });
    // Should cap at 168 hours
    expect(result.regularPay).toBe(1680);
  });
});
