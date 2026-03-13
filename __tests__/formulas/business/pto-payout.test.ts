import { calculatePtoPayout } from '@/lib/formulas/business/pto-payout';

describe('calculatePtoPayout', () => {
  // ─── Test 1: Standard payout (80 hours at $25/hr, 22% tax) ───
  it('calculates standard PTO payout (80hrs, $25/hr, 22% tax)', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Gross: 80 × $25 = $2,000
    // Tax: $2,000 × 0.22 = $440
    // Net: $2,000 - $440 = $1,560
    expect(result.grossPayout).toBe(2000);
    expect(result.taxWithholding).toBe(440);
    expect(result.netPayout).toBe(1560);
  });

  // ─── Test 2: With accrued days ───
  it('converts accrued days to hours and adds to total', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 40,
      accruedDays: 5,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Total hours: 40 + (5 × 8) = 80
    // Gross: 80 × $25 = $2,000
    expect(result.totalHours).toBe(80);
    expect(result.totalDays).toBe(10);
    expect(result.grossPayout).toBe(2000);
  });

  // ─── Test 3: High hourly rate ($75/hr) ───
  it('calculates payout for high hourly rate ($75/hr)', () => {
    const result = calculatePtoPayout({
      hourlyRate: 75,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Gross: 80 × $75 = $6,000
    // Tax: $6,000 × 0.22 = $1,320
    // Net: $6,000 - $1,320 = $4,680
    expect(result.grossPayout).toBe(6000);
    expect(result.taxWithholding).toBe(1320);
    expect(result.netPayout).toBe(4680);
  });

  // ─── Test 4: Minimum wage ($7.25/hr) ───
  it('calculates payout at minimum wage ($7.25/hr)', () => {
    const result = calculatePtoPayout({
      hourlyRate: 7.25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Gross: 80 × $7.25 = $580
    // Tax: $580 × 0.22 = $127.60
    // Net: $580 - $127.60 = $452.40
    expect(result.grossPayout).toBe(580);
    expect(result.taxWithholding).toBe(127.6);
    expect(result.netPayout).toBe(452.4);
  });

  // ─── Test 5: Zero hours (all zeros) ───
  it('returns zero for zero accrued hours', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 0,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    expect(result.totalHours).toBe(0);
    expect(result.totalDays).toBe(0);
    expect(result.grossPayout).toBe(0);
    expect(result.taxWithholding).toBe(0);
    expect(result.netPayout).toBe(0);
    expect(result.totalWeeksOff).toBe(0);
  });

  // ─── Test 6: Zero hourly rate ───
  it('returns zero payout for zero hourly rate', () => {
    const result = calculatePtoPayout({
      hourlyRate: 0,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    expect(result.totalHours).toBe(80);
    expect(result.totalDays).toBe(10);
    expect(result.grossPayout).toBe(0);
    expect(result.netPayout).toBe(0);
    expect(result.dailyValue).toBe(0);
    expect(result.weeklyValue).toBe(0);
  });

  // ─── Test 7: Partial payout (50%) ───
  it('calculates partial payout at 50%', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'partial-payout',
      payoutPercent: 50,
    });
    // Gross: 80 × $25 × 0.50 = $1,000
    // Tax: $1,000 × 0.22 = $220
    // Net: $1,000 - $220 = $780
    expect(result.grossPayout).toBe(1000);
    expect(result.taxWithholding).toBe(220);
    expect(result.netPayout).toBe(780);
  });

  // ─── Test 8: Use-it-or-lose-it (zero payout) ───
  it('returns zero payout for use-it-or-lose-it policy', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'use-it-or-lose-it',
      payoutPercent: 100,
    });
    // Hours are still calculated but payout is $0
    expect(result.totalHours).toBe(80);
    expect(result.totalDays).toBe(10);
    expect(result.grossPayout).toBe(0);
    expect(result.taxWithholding).toBe(0);
    expect(result.netPayout).toBe(0);
    // Daily/weekly value still shows the accrued value
    expect(result.dailyValue).toBe(200);
    expect(result.weeklyValue).toBe(1000);
  });

  // ─── Test 9: 10-hour work day ───
  it('handles 10-hour work days', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 0,
      accruedDays: 10,
      hoursPerDay: 10,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Total hours: 0 + (10 × 10) = 100
    // Gross: 100 × $25 = $2,500
    expect(result.totalHours).toBe(100);
    expect(result.totalDays).toBe(10);
    expect(result.grossPayout).toBe(2500);
    expect(result.dailyValue).toBe(250);
    expect(result.weeklyValue).toBe(1250);
  });

  // ─── Test 10: Zero tax rate ───
  it('calculates payout with 0% tax rate', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 0,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Gross: $2,000, Tax: $0, Net: $2,000
    expect(result.grossPayout).toBe(2000);
    expect(result.taxWithholding).toBe(0);
    expect(result.netPayout).toBe(2000);
  });

  // ─── Test 11: 35% tax rate ───
  it('calculates payout with 35% tax rate', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 35,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Gross: $2,000, Tax: $700, Net: $1,300
    expect(result.grossPayout).toBe(2000);
    expect(result.taxWithholding).toBe(700);
    expect(result.netPayout).toBe(1300);
  });

  // ─── Test 12: Large PTO balance (400 hours) ───
  it('handles large PTO balance (400 hours)', () => {
    const result = calculatePtoPayout({
      hourlyRate: 50,
      accruedHours: 400,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Gross: 400 × $50 = $20,000
    // Tax: $20,000 × 0.22 = $4,400
    // Net: $20,000 - $4,400 = $15,600
    expect(result.totalHours).toBe(400);
    expect(result.totalDays).toBe(50);
    expect(result.grossPayout).toBe(20000);
    expect(result.taxWithholding).toBe(4400);
    expect(result.netPayout).toBe(15600);
  });

  // ─── Test 13: Daily and weekly value calculation ───
  it('calculates daily and weekly value correctly', () => {
    const result = calculatePtoPayout({
      hourlyRate: 30,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Daily: $30 × 8 = $240
    // Weekly: $240 × 5 = $1,200
    expect(result.dailyValue).toBe(240);
    expect(result.weeklyValue).toBe(1200);
  });

  // ─── Test 14: Total weeks off calculation ───
  it('calculates total weeks off correctly', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 120,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Total days: 120 / 8 = 15
    // Total weeks: 15 / 5 = 3.0
    expect(result.totalDays).toBe(15);
    expect(result.totalWeeksOff).toBe(3);
  });

  // ─── Test 15: Breakdown structure validation ───
  it('returns payoutBreakdown with correct labels', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    const breakdown = result.payoutBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(3);
    const labels = breakdown.map((b) => b.label);
    expect(labels).toContain('Gross PTO Payout');
    expect(labels).toContain('Tax Withholding');
    expect(labels).toContain('Net Payout');
  });

  // ─── Test 16: Output structure validation ───
  it('returns all expected output fields', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    expect(result).toHaveProperty('totalHours');
    expect(result).toHaveProperty('totalDays');
    expect(result).toHaveProperty('grossPayout');
    expect(result).toHaveProperty('taxWithholding');
    expect(result).toHaveProperty('netPayout');
    expect(result).toHaveProperty('dailyValue');
    expect(result).toHaveProperty('weeklyValue');
    expect(result).toHaveProperty('totalWeeksOff');
    expect(result).toHaveProperty('payoutBreakdown');
  });

  // ─── Test 17: Full-payout ignores payoutPercent ───
  it('full-payout policy always pays 100% regardless of payoutPercent', () => {
    const result = calculatePtoPayout({
      hourlyRate: 25,
      accruedHours: 80,
      accruedDays: 0,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 50,
    });
    // Full-payout should always pay 100%
    expect(result.grossPayout).toBe(2000);
  });

  // ─── Test 18: Missing inputs use safe defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculatePtoPayout({});
    expect(result.totalHours).toBe(0);
    expect(result.grossPayout).toBe(0);
    expect(result.netPayout).toBe(0);
    // hoursPerDay defaults to 8
    expect(result.dailyValue).toBe(0);
  });

  // ─── Test 19: Worked example from MDX ($40/hr, 120 hours + 5 days) ───
  it('matches MDX worked example ($40/hr, 120hrs + 5 days)', () => {
    const result = calculatePtoPayout({
      hourlyRate: 40,
      accruedHours: 120,
      accruedDays: 5,
      hoursPerDay: 8,
      taxRate: 22,
      ptoPolicy: 'full-payout',
      payoutPercent: 100,
    });
    // Total hours: 120 + (5 × 8) = 160
    // Gross: 160 × $40 = $6,400
    // Tax: $6,400 × 0.22 = $1,408
    // Net: $6,400 - $1,408 = $4,992
    expect(result.totalHours).toBe(160);
    expect(result.totalDays).toBe(20);
    expect(result.grossPayout).toBe(6400);
    expect(result.taxWithholding).toBe(1408);
    expect(result.netPayout).toBe(4992);
    expect(result.totalWeeksOff).toBe(4);
  });
});
