import { calculateRentVsBuy } from '@/lib/formulas/finance/rent-vs-buy';

describe('calculateRentVsBuy', () => {
  const defaultInputs = {
    homePrice: 400000,
    downPaymentPercent: 20,
    interestRate: 6.5,
    loanTerm: 30,
    monthlyRent: 2000,
    annualRentIncrease: 3,
    propertyTaxRate: 1.2,
    annualInsurance: 1500,
    annualMaintenance: 1,
    homeAppreciation: 3,
    investmentReturn: 7,
    yearsToCompare: 10,
  };

  // ─── Test 1: Basic 10-year comparison returns valid results ───
  it('returns valid results for standard 10-year comparison', () => {
    const result = calculateRentVsBuy(defaultInputs);
    expect(Number(result.totalRentCost)).toBeGreaterThan(0);
    expect(typeof result.totalBuyCost).toBe('number');
    expect(typeof result.recommendation).toBe('string');
    expect((result.recommendation as string).length).toBeGreaterThan(0);
  });

  // ─── Test 2: Zero inputs returns empty results ───
  it('returns empty results when both home price and rent are zero', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      homePrice: 0,
      monthlyRent: 0,
    });
    expect(result.totalRentCost).toBe(0);
    expect(result.totalBuyCost).toBe(0);
    expect(result.recommendation).toBe('Enter values to compare');
  });

  // ─── Test 3: Year-by-year data has correct length ───
  it('returns correct number of year-by-year comparison entries', () => {
    const result = calculateRentVsBuy(defaultInputs);
    const yearByYear = result.yearByYear as Array<{
      year: number;
      rentTotal: number;
      buyTotal: number;
      difference: number;
    }>;
    expect(yearByYear).toHaveLength(10);
    expect(yearByYear[0].year).toBe(1);
    expect(yearByYear[9].year).toBe(10);
  });

  // ─── Test 4: Cost comparison chart has correct length ───
  it('returns cost comparison chart data matching years', () => {
    const result = calculateRentVsBuy({ ...defaultInputs, yearsToCompare: 5 });
    const chart = result.costComparison as Array<{
      year: number;
      rentTotal: number;
      buyTotal: number;
    }>;
    expect(chart).toHaveLength(5);
  });

  // ─── Test 5: Buying wins over long horizon with appreciation ───
  it('buying wins over 15 years with normal appreciation', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      yearsToCompare: 15,
    });
    const yearByYear = result.yearByYear as Array<{ difference: number }>;
    const finalYear = yearByYear[yearByYear.length - 1];
    // With 3% appreciation over 15 years, buying should win
    expect(finalYear.difference).toBeGreaterThan(0);
  });

  // ─── Test 6: Renting wins in short horizon ───
  it('renting can win in very short horizon with high buy costs', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      yearsToCompare: 1,
      homeAppreciation: 0,
    });
    const yearByYear = result.yearByYear as Array<{ difference: number }>;
    // At year 1 with 0% appreciation, closing costs + high initial costs make buying expensive
    expect(yearByYear[0].difference).toBeLessThan(0);
  });

  // ─── Test 7: Break-even year is found when buying eventually wins ───
  it('finds break-even year when buying becomes cheaper', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      yearsToCompare: 15,
    });
    const breakEven = result.breakEvenYear as number;
    expect(breakEven).toBeGreaterThan(0);
    expect(breakEven).toBeLessThanOrEqual(15);
  });

  // ─── Test 8: No break-even with zero appreciation and short horizon ───
  it('returns zero break-even when buying never wins', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      yearsToCompare: 3,
      homeAppreciation: 0,
      monthlyRent: 1000, // cheap rent
    });
    // With zero appreciation, cheap rent, and 3-year horizon, buying may not break even
    expect(result.breakEvenYear).toBe(0);
  });

  // ─── Test 9: Higher rent makes buying more attractive ───
  it('higher rent shifts recommendation toward buying', () => {
    const lowRent = calculateRentVsBuy({
      ...defaultInputs,
      monthlyRent: 1000,
      yearsToCompare: 10,
    });
    const highRent = calculateRentVsBuy({
      ...defaultInputs,
      monthlyRent: 3000,
      yearsToCompare: 10,
    });
    // Higher rent → higher rent cost → bigger difference favoring buying
    const lowYears = lowRent.yearByYear as Array<{ difference: number }>;
    const highYears = highRent.yearByYear as Array<{ difference: number }>;
    expect(highYears[9].difference).toBeGreaterThan(lowYears[9].difference);
  });

  // ─── Test 10: Higher investment return makes renting more attractive ───
  it('higher investment return shifts recommendation toward renting', () => {
    const lowReturn = calculateRentVsBuy({
      ...defaultInputs,
      investmentReturn: 3,
      yearsToCompare: 10,
    });
    const highReturn = calculateRentVsBuy({
      ...defaultInputs,
      investmentReturn: 12,
      yearsToCompare: 10,
    });
    const lowYears = lowReturn.yearByYear as Array<{ difference: number }>;
    const highYears = highReturn.yearByYear as Array<{ difference: number }>;
    // Higher investment return → down payment grows more → renting looks better
    expect(highYears[9].difference).toBeLessThan(lowYears[9].difference);
  });

  // ─── Test 11: Summary contains all required labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateRentVsBuy(defaultInputs);
    const summary = result.summary as Array<{ label: string; value: number | string }>;
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Home Price');
    expect(labels).toContain('Down Payment');
    expect(labels).toContain('Monthly Mortgage (P&I)');
    expect(labels).toContain('Monthly Rent (starting)');
    expect(labels).toContain('Net Cost of Renting');
    expect(labels).toContain('Net Cost of Buying');
    expect(labels).toContain('Comparison Period');
  });

  // ─── Test 12: Monthly mortgage calculation is accurate ───
  it('calculates monthly mortgage payment correctly', () => {
    const result = calculateRentVsBuy(defaultInputs);
    const summary = result.summary as Array<{ label: string; value: number }>;
    const mortgage = summary.find(s => s.label === 'Monthly Mortgage (P&I)');
    // $320,000 at 6.5% for 30 years ≈ $2,023
    expect(mortgage).toBeDefined();
    expect(mortgage!.value).toBeCloseTo(2023, -1);
  });

  // ─── Test 13: Zero interest rate mortgage ───
  it('handles zero interest rate correctly', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      interestRate: 0,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const mortgage = summary.find(s => s.label === 'Monthly Mortgage (P&I)');
    // $320,000 / 360 months ≈ $888.89
    expect(mortgage!.value).toBeCloseTo(888.89, 0);
  });

  // ─── Test 14: 15-year loan term ───
  it('calculates correctly for 15-year loan term', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      loanTerm: 15,
      yearsToCompare: 10,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const mortgage = summary.find(s => s.label === 'Monthly Mortgage (P&I)');
    // 15-year mortgage payment should be higher than 30-year
    expect(mortgage!.value).toBeGreaterThan(2500);
  });

  // ─── Test 15: Years to compare is clamped to 1-30 ───
  it('clamps years to compare within valid range', () => {
    // 0 is falsy, so || 10 defaults to 10, then clamped to max(1, min(30, 10)) = 10
    const zeroInput = calculateRentVsBuy({
      ...defaultInputs,
      yearsToCompare: 0,
    });
    const tooHigh = calculateRentVsBuy({
      ...defaultInputs,
      yearsToCompare: 50,
    });
    const zeroYears = zeroInput.yearByYear as Array<{ year: number }>;
    const highYears = tooHigh.yearByYear as Array<{ year: number }>;
    expect(zeroYears).toHaveLength(10); // defaults to 10 when 0 is passed
    expect(highYears).toHaveLength(30); // clamped to max 30
  });

  // ─── Test 16: Recommendation text mentions buying or renting ───
  it('recommendation mentions buying or renting with dollar amount', () => {
    const result = calculateRentVsBuy(defaultInputs);
    const rec = result.recommendation as string;
    expect(rec).toMatch(/(Buying saves|Renting saves|approximately the same)/);
  });

  // ─── Test 17: Rent increases year over year ───
  it('applies annual rent increases correctly', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      annualRentIncrease: 5,
      yearsToCompare: 5,
    });
    const noIncrease = calculateRentVsBuy({
      ...defaultInputs,
      annualRentIncrease: 0,
      yearsToCompare: 5,
    });
    // Higher rent increase → higher total rent cost
    expect(Number(result.totalRentCost)).toBeGreaterThan(Number(noIncrease.totalRentCost));
  });

  // ─── Test 18: Zero down payment works ───
  it('handles zero down payment correctly', () => {
    const result = calculateRentVsBuy({
      ...defaultInputs,
      downPaymentPercent: 0,
    });
    const summary = result.summary as Array<{ label: string; value: number }>;
    const dp = summary.find(s => s.label === 'Down Payment');
    expect(dp!.value).toBe(0);
    // Full home price is financed
    const mortgage = summary.find(s => s.label === 'Monthly Mortgage (P&I)');
    expect(mortgage!.value).toBeGreaterThan(2500); // $400k fully financed at 6.5%
  });
});
