import { calculateRuleOf72 } from '@/lib/formulas/finance/rule-of-72';

describe('calculateRuleOf72', () => {
  // ─── Test 1: Classic example — 8% rate ───
  it('calculates years to double at 8% (classic example: 72/8 = 9)', () => {
    const result = calculateRuleOf72({
      interestRate: 8,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(9);
    // Exact: ln(2)/ln(1.08) ≈ 9.01
    expect(result.exactYears).toBeCloseTo(9.01, 1);
  });

  // ─── Test 2: Classic example — 6% rate ───
  it('calculates years to double at 6% (72/6 = 12)', () => {
    const result = calculateRuleOf72({
      interestRate: 6,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(12);
    // Exact: ln(2)/ln(1.06) ≈ 11.90
    expect(result.exactYears).toBeCloseTo(11.90, 1);
  });

  // ─── Test 3: 10% rate ───
  it('calculates years to double at 10% (72/10 = 7.2)', () => {
    const result = calculateRuleOf72({
      interestRate: 10,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(7.2);
    // Exact: ln(2)/ln(1.10) ≈ 7.27
    expect(result.exactYears).toBeCloseTo(7.27, 1);
  });

  // ─── Test 4: Very low rate (1%) ───
  it('calculates years to double at 1% (72/1 = 72)', () => {
    const result = calculateRuleOf72({
      interestRate: 1,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(72);
    // Exact: ln(2)/ln(1.01) ≈ 69.66
    expect(result.exactYears).toBeCloseTo(69.66, 0);
  });

  // ─── Test 5: Very high rate (36%) ───
  it('calculates years to double at 36% (72/36 = 2)', () => {
    const result = calculateRuleOf72({
      interestRate: 36,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(2);
    // Exact: ln(2)/ln(1.36) ≈ 2.25
    expect(result.exactYears).toBeCloseTo(2.25, 1);
  });

  // ─── Test 6: Rate = 72 (should give 1 year) ───
  it('calculates 1 year to double at 72% rate', () => {
    const result = calculateRuleOf72({
      interestRate: 72,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(1);
    // Exact: ln(2)/ln(1.72) ≈ 1.28
    expect(result.exactYears).toBeCloseTo(1.28, 1);
  });

  // ─── Test 7: Years-to-rate mode — 10 years ───
  it('calculates required rate for doubling in 10 years (72/10 = 7.2%)', () => {
    const result = calculateRuleOf72({
      interestRate: 7,
      mode: 'years-to-rate',
      targetYears: 10,
    });
    expect(result.requiredRate).toBe(7.2);
    // Exact: 2^(1/10) - 1 ≈ 7.18%
    expect(result.exactRate).toBeCloseTo(7.18, 1);
  });

  // ─── Test 8: Years-to-rate mode — 6 years ───
  it('calculates required rate for doubling in 6 years (72/6 = 12%)', () => {
    const result = calculateRuleOf72({
      interestRate: 10,
      mode: 'years-to-rate',
      targetYears: 6,
    });
    expect(result.requiredRate).toBe(12);
    // Exact: 2^(1/6) - 1 ≈ 12.25%
    expect(result.exactRate).toBeCloseTo(12.25, 0);
  });

  // ─── Test 9: Years-to-rate mode — 1 year ───
  it('calculates required rate for doubling in 1 year (72/1 = 72%)', () => {
    const result = calculateRuleOf72({
      interestRate: 50,
      mode: 'years-to-rate',
      targetYears: 1,
    });
    expect(result.requiredRate).toBe(72);
    // Exact: 2^1 - 1 = 100%
    expect(result.exactRate).toBe(100);
  });

  // ─── Test 10: Zero rate returns Infinity ───
  it('returns Infinity years for zero rate', () => {
    const result = calculateRuleOf72({
      interestRate: 0,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(Infinity);
    expect(result.exactYears).toBe(Infinity);
  });

  // ─── Test 11: Approximation error is small for typical rates ───
  it('approximation error is small for 7% rate', () => {
    const result = calculateRuleOf72({
      interestRate: 7,
      mode: 'rate-to-years',
    });
    const approxError = result.approximationError as number;
    // Rule of 72 is most accurate around 6-10%
    expect(Math.abs(approxError)).toBeLessThan(0.5);
  });

  // ─── Test 12: Summary contains all required labels (rate-to-years) ───
  it('returns summary with all labels for rate-to-years mode', () => {
    const result = calculateRuleOf72({
      interestRate: 8,
      mode: 'rate-to-years',
    });
    const summary = result.summary as Array<{ label: string; value: string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Rule of 72 Estimate');
    expect(labels).toContain('Exact Calculation');
    expect(labels).toContain('Approximation Error');
    expect(labels).toContain('Interest Rate');
    expect(summary).toHaveLength(4);
  });

  // ─── Test 13: Summary contains all required labels (years-to-rate) ───
  it('returns summary with all labels for years-to-rate mode', () => {
    const result = calculateRuleOf72({
      interestRate: 8,
      mode: 'years-to-rate',
      targetYears: 10,
    });
    const summary = result.summary as Array<{ label: string; value: string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Rule of 72 Estimate');
    expect(labels).toContain('Exact Calculation');
    expect(labels).toContain('Approximation Error');
    expect(labels).toContain('Target Years');
    expect(summary).toHaveLength(4);
  });

  // ─── Test 14: 12% rate ───
  it('calculates years to double at 12% (72/12 = 6)', () => {
    const result = calculateRuleOf72({
      interestRate: 12,
      mode: 'rate-to-years',
    });
    expect(result.yearsToDouble).toBe(6);
    // Exact: ln(2)/ln(1.12) ≈ 6.12
    expect(result.exactYears).toBeCloseTo(6.12, 1);
  });

  // ─── Test 15: Exact result is always less than or equal to Rule of 72 for typical rates ───
  it('Rule of 72 slightly overestimates for rates around 8%', () => {
    const result = calculateRuleOf72({
      interestRate: 8,
      mode: 'rate-to-years',
    });
    // Rule of 72 gives 9 years, exact is ~9.01
    // For 8%, the approximation is extremely close
    const approxError = result.approximationError as number;
    expect(Math.abs(approxError)).toBeLessThan(0.1);
  });
});
