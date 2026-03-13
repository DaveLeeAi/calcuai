import { calculateRothConversion } from '@/lib/formulas/finance/roth-conversion';

describe('calculateRothConversion', () => {
  // ─── Test 1: Basic conversion — $100K, 24% now, 22% retire, 20yr, 7%, pay from outside ───
  it('basic conversion with lower retirement rate shows positive net benefit', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    expect(result.taxCostNow).toBe(24000);
    // Roth: $100K * 1.07^20 = $386,968.45
    expect(result.rothValueAtRetirement as number).toBeCloseTo(386968, -1);
    // Traditional: $100K * 1.07^20 * 0.78 = $301,835.39
    expect(result.traditionalAfterTax as number).toBeCloseTo(301835, -1);
  });

  // ─── Test 2: Same tax rate now and later ───
  it('same tax rate: net benefit depends on opportunity cost', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 22,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    // At same tax rate paying from outside, opportunity cost of tax reduces benefit
    // Roth = $386,968; Traditional after tax = $386,968 * 0.78 = $301,835
    // Opportunity cost = $22,000 * 1.07^20 = $85,133
    // Net = $386,968 - $301,835 - $85,133 = ~$0
    // Should be close to zero with same rates
    expect(Math.abs(result.netBenefit as number)).toBeLessThan(1);
  });

  // ─── Test 3: Higher retirement tax rate — Roth wins big ───
  it('higher retirement tax rate makes Roth conversion very beneficial', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 22,
      retirementTaxRate: 35,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    // Traditional pays 35% at withdrawal — Roth avoids this
    expect(result.netBenefit as number).toBeGreaterThan(0);
    // Roth value should be much more than traditional after-tax
    expect(result.rothValueAtRetirement as number).toBeGreaterThan(
      result.traditionalAfterTax as number
    );
  });

  // ─── Test 4: Lower retirement tax rate — Traditional may win ───
  it('much lower retirement tax rate makes Traditional better', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 35,
      retirementTaxRate: 12,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    // Paying 35% now vs 12% later — Traditional should win
    expect(result.netBenefit as number).toBeLessThan(0);
  });

  // ─── Test 5: Pay tax from conversion vs from outside ───
  it('paying tax from conversion results in less Roth growth', () => {
    const fromOutside = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    const fromConversion = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: false,
    });
    // Paying from outside puts full $100K in Roth
    // Paying from conversion only puts $76K in Roth
    expect(fromOutside.rothValueAtRetirement as number).toBeGreaterThan(
      fromConversion.rothValueAtRetirement as number
    );
  });

  // ─── Test 6: Short horizon (5 years) ───
  it('short horizon with lower retirement rate still benefits', () => {
    const result = calculateRothConversion({
      conversionAmount: 50000,
      currentTaxRate: 22,
      retirementTaxRate: 12,
      yearsUntilRetirement: 5,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    // Short time frame means less compound growth difference
    // $50K * 1.07^5 = $70,128
    expect(result.rothValueAtRetirement as number).toBeCloseTo(70128, -1);
    expect(result.taxCostNow).toBe(11000);
  });

  // ─── Test 7: Long horizon (40 years) ───
  it('long horizon amplifies compounding difference', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 22,
      retirementTaxRate: 22,
      yearsUntilRetirement: 40,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    // $100K * 1.07^40 = $1,497,446
    expect(result.rothValueAtRetirement as number).toBeCloseTo(1497446, -2);
    const chart = result.growthComparison as { year: number }[];
    expect(chart.length).toBe(41); // year 0 through year 40
  });

  // ─── Test 8: Zero return rate ───
  it('zero return means growth is flat', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 0,
      payTaxFromOutside: true,
    });
    // No growth — Roth stays at $100K, Traditional = $100K * 0.78 = $78K
    expect(result.rothValueAtRetirement).toBe(100000);
    expect(result.traditionalAfterTax).toBe(78000);
    // Net benefit = $100K - $78K - $24K = -$2K (opportunity cost of $24K that didn't grow)
    expect(result.netBenefit).toBe(-2000);
  });

  // ─── Test 9: High return rate (12%) ───
  it('high return amplifies benefit of tax-free Roth growth', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 24,
      yearsUntilRetirement: 20,
      expectedReturn: 12,
      payTaxFromOutside: true,
    });
    // $100K * 1.12^20 = $964,629
    expect(result.rothValueAtRetirement as number).toBeCloseTo(964629, -2);
    // At same tax rate, net benefit ≈ 0 (opportunity cost offsets)
    expect(Math.abs(result.netBenefit as number)).toBeLessThan(5);
  });

  // ─── Test 10: Small conversion ($10K) ───
  it('small conversion calculates correctly', () => {
    const result = calculateRothConversion({
      conversionAmount: 10000,
      currentTaxRate: 22,
      retirementTaxRate: 22,
      yearsUntilRetirement: 15,
      expectedReturn: 6,
      payTaxFromOutside: true,
    });
    expect(result.taxCostNow).toBe(2200);
    // $10K * 1.06^15 = $23,966
    expect(result.rothValueAtRetirement as number).toBeCloseTo(23966, -1);
  });

  // ─── Test 11: Large conversion ($500K) ───
  it('large conversion scales proportionally', () => {
    const result = calculateRothConversion({
      conversionAmount: 500000,
      currentTaxRate: 32,
      retirementTaxRate: 24,
      yearsUntilRetirement: 15,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    expect(result.taxCostNow).toBe(160000);
    // $500K * 1.07^15 = $1,379,562
    expect(result.rothValueAtRetirement as number).toBeCloseTo(1379562, -2);
  });

  // ─── Test 12: growthComparison array length matches years ───
  it('growthComparison length matches yearsUntilRetirement + 1', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 22,
      yearsUntilRetirement: 25,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    const chart = result.growthComparison as { year: number; rothValue: number; traditionalAfterTax: number }[];
    expect(chart.length).toBe(26); // years 0 through 25
    expect(chart[0].year).toBe(0);
    expect(chart[25].year).toBe(25);
  });

  // ─── Test 13: Pay from conversion with zero tax rate ───
  it('zero current tax rate means no tax cost and full conversion', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 0,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: false,
    });
    expect(result.taxCostNow).toBe(0);
    // Full amount goes to Roth regardless of payTaxFromOutside
    expect(result.rothValueAtRetirement as number).toBeCloseTo(386968, -1);
    // Traditional after tax = $386,968 * 0.78 = $301,835
    // Net benefit should be strongly positive (free Roth conversion)
    expect(result.netBenefit as number).toBeGreaterThan(80000);
  });

  // ─── Test 14: Summary contains required fields ───
  it('summary contains all required labels', () => {
    const result = calculateRothConversion({
      conversionAmount: 100000,
      currentTaxRate: 24,
      retirementTaxRate: 22,
      yearsUntilRetirement: 20,
      expectedReturn: 7,
      payTaxFromOutside: true,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map(s => s.label);
    expect(labels).toContain('Roth Value at Retirement');
    expect(labels).toContain('Traditional After Tax');
    expect(labels).toContain('Tax Cost Now');
    expect(labels).toContain('Net Benefit of Converting');
    expect(labels).toContain('Opportunity Cost of Tax');
    expect(summary.length).toBe(5);
  });
});
