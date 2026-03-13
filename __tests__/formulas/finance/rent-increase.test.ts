import { calculateRentIncrease } from '@/lib/formulas/finance/rent-increase';

describe('calculateRentIncrease', () => {
  const defaultInputs = {
    currentRent: 1500,
    annualIncrease: 3,
    years: 5,
    inflationRate: 2.5,
  };

  // ─── Test 1: Default values produce expected future rent ───
  it('calculates future rent with default values', () => {
    const result = calculateRentIncrease(defaultInputs);
    // $1500 × (1.03)^5 = $1738.91
    expect(Number(result.futureRent)).toBeCloseTo(1738.91, 0);
  });

  // ─── Test 2: Zero annual increase — rent stays flat ───
  it('keeps rent flat with zero annual increase', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      annualIncrease: 0,
    });
    expect(result.futureRent).toBe(1500);
    expect(result.totalIncrease).toBe(0);
    expect(result.percentIncrease).toBe(0);
  });

  // ─── Test 3: High annual increase (10%) ───
  it('handles high annual increase correctly', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      annualIncrease: 10,
    });
    // $1500 × (1.10)^5 = $2415.77
    expect(Number(result.futureRent)).toBeCloseTo(2415.77, 0);
    expect(Number(result.percentIncrease)).toBeGreaterThan(50);
  });

  // ─── Test 4: Single year ───
  it('calculates correctly for 1 year', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      years: 1,
    });
    // Future rent after 1 year = $1500 × 1.03 = $1545
    expect(Number(result.futureRent)).toBeCloseTo(1545, 0);
    // Total paid = $1500 × 12 = $18,000 (year 1 rent is still currentRent)
    expect(Number(result.totalRentPaid)).toBe(18000);
  });

  // ─── Test 5: 30 years ───
  it('handles 30-year projection', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      years: 30,
    });
    // $1500 × (1.03)^30 ≈ $3640.89
    expect(Number(result.futureRent)).toBeCloseTo(3640.89, 0);
    expect(Number(result.totalRentPaid)).toBeGreaterThan(500000);
  });

  // ─── Test 6: Zero rent ───
  it('handles zero rent gracefully', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      currentRent: 0,
    });
    expect(result.futureRent).toBe(0);
    expect(result.totalRentPaid).toBe(0);
    expect(result.totalIncrease).toBe(0);
  });

  // ─── Test 7: Zero years ───
  it('handles zero years gracefully', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      years: 0,
    });
    expect(result.futureRent).toBe(1500);
    expect(result.totalRentPaid).toBe(0);
    const yearByYear = result.yearByYear as Array<{ label: string; value: number }>;
    expect(yearByYear).toHaveLength(0);
  });

  // ─── Test 8: Total rent paid calculation ───
  it('calculates total rent paid correctly for 3 years', () => {
    const result = calculateRentIncrease({
      currentRent: 1000,
      annualIncrease: 5,
      years: 3,
      inflationRate: 0,
    });
    // Year 1: $1000 × 12 = $12,000
    // Year 2: $1050 × 12 = $12,600
    // Year 3: $1102.50 × 12 = $13,230
    // Total = $37,830
    expect(Number(result.totalRentPaid)).toBeCloseTo(37830, 0);
  });

  // ─── Test 9: Total increase ───
  it('calculates total monthly increase', () => {
    const result = calculateRentIncrease(defaultInputs);
    const expected = Number(result.futureRent) - 1500;
    expect(Number(result.totalIncrease)).toBeCloseTo(expected, 2);
  });

  // ─── Test 10: Percent increase ───
  it('calculates percent increase correctly', () => {
    const result = calculateRentIncrease({
      currentRent: 1000,
      annualIncrease: 10,
      years: 1,
      inflationRate: 0,
    });
    expect(Number(result.percentIncrease)).toBeCloseTo(10, 1);
  });

  // ─── Test 11: Average monthly rent ───
  it('calculates average monthly rent', () => {
    const result = calculateRentIncrease(defaultInputs);
    const avgRent = Number(result.totalRentPaid) / (5 * 12);
    expect(Number(result.averageMonthlyRent)).toBeCloseTo(avgRent, 2);
  });

  // ─── Test 12: Inflation-adjusted total with zero inflation ───
  it('real cost equals nominal cost when inflation is zero', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      inflationRate: 0,
    });
    expect(Number(result.realCostTotal)).toBeCloseTo(Number(result.totalRentPaid), 0);
  });

  // ─── Test 13: Inflation-adjusted total is less than nominal ───
  it('real cost is less than nominal when inflation is positive', () => {
    const result = calculateRentIncrease(defaultInputs);
    expect(Number(result.realCostTotal)).toBeLessThan(Number(result.totalRentPaid));
  });

  // ─── Test 14: Year-by-year array has correct length ───
  it('year-by-year array has correct number of entries', () => {
    const result = calculateRentIncrease(defaultInputs);
    const yearByYear = result.yearByYear as Array<{ label: string; value: number }>;
    expect(yearByYear).toHaveLength(5);
  });

  // ─── Test 15: Year-by-year labels are correct ───
  it('year-by-year labels are formatted correctly', () => {
    const result = calculateRentIncrease(defaultInputs);
    const yearByYear = result.yearByYear as Array<{ label: string; value: number }>;
    expect(yearByYear[0].label).toBe('Year 1');
    expect(yearByYear[4].label).toBe('Year 5');
  });

  // ─── Test 16: Year-by-year values increase ───
  it('year-by-year values increase each year', () => {
    const result = calculateRentIncrease(defaultInputs);
    const yearByYear = result.yearByYear as Array<{ label: string; value: number }>;
    for (let i = 1; i < yearByYear.length; i++) {
      expect(yearByYear[i].value).toBeGreaterThan(yearByYear[i - 1].value);
    }
  });

  // ─── Test 17: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateRentIncrease(defaultInputs);
    expect(result).toHaveProperty('futureRent');
    expect(result).toHaveProperty('totalRentPaid');
    expect(result).toHaveProperty('totalIncrease');
    expect(result).toHaveProperty('percentIncrease');
    expect(result).toHaveProperty('averageMonthlyRent');
    expect(result).toHaveProperty('realCostTotal');
    expect(result).toHaveProperty('yearByYear');
  });

  // ─── Test 18: Very small increase (0.5%) ───
  it('handles very small annual increase', () => {
    const result = calculateRentIncrease({
      ...defaultInputs,
      annualIncrease: 0.5,
    });
    // $1500 × (1.005)^5 ≈ $1537.78
    expect(Number(result.futureRent)).toBeCloseTo(1537.78, 0);
  });

  // ─── Test 19: High rent value ───
  it('handles high rent values correctly', () => {
    const result = calculateRentIncrease({
      currentRent: 10000,
      annualIncrease: 3,
      years: 5,
      inflationRate: 2.5,
    });
    // $10000 × (1.03)^5 = $11592.74
    expect(Number(result.futureRent)).toBeCloseTo(11592.74, 0);
  });

  // ─── Test 20: Year 1 rent in year-by-year matches current rent ───
  it('year 1 in breakdown matches current rent', () => {
    const result = calculateRentIncrease(defaultInputs);
    const yearByYear = result.yearByYear as Array<{ label: string; value: number }>;
    expect(yearByYear[0].value).toBe(1500);
  });

  // ─── Test 21: Future rent equals last year rent increased once more ───
  it('future rent is one increase beyond last year-by-year entry', () => {
    const result = calculateRentIncrease(defaultInputs);
    const yearByYear = result.yearByYear as Array<{ label: string; value: number }>;
    const lastYearRent = yearByYear[yearByYear.length - 1].value;
    // futureRent = lastYearRent × (1 + 0.03)
    expect(Number(result.futureRent)).toBeCloseTo(lastYearRent * 1.03, 1);
  });

  // ─── Test 22: High inflation makes real cost significantly lower ───
  it('high inflation reduces real cost significantly', () => {
    const lowInflation = calculateRentIncrease({
      ...defaultInputs,
      inflationRate: 1,
    });
    const highInflation = calculateRentIncrease({
      ...defaultInputs,
      inflationRate: 8,
    });
    expect(Number(highInflation.realCostTotal)).toBeLessThan(Number(lowInflation.realCostTotal));
  });
});
