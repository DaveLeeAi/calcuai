import { calculateSolarPanel } from '@/lib/formulas/everyday/solar-panel';

describe('calculateSolarPanel', () => {
  // ─── Test 1: Standard $150 bill at $0.15/kWh in 5 sun hours ───
  it('calculates standard $150/month bill correctly', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    // monthlyKWh = 150 / 0.15 = 1000
    expect(result.monthlyUsage).toBe(1000);
    // annualKWh = 12000
    // dailyKWh = 12000 / 365 = 32.877
    // systemSizeKW = 32.877 / 5 / 0.80 = 8.22 kW
    expect(result.systemSizeKW).toBeGreaterThan(8);
    expect(result.systemSizeKW).toBeLessThan(9);
    // panels = ceil(8.22 * 1000 / 400) = ceil(20.5) = 21
    expect(result.numberOfPanels).toBe(21);
  });

  // ─── Test 2: High bill ($300) ───
  it('calculates high $300/month bill', () => {
    const result = calculateSolarPanel({
      monthlyBill: 300,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    // monthlyKWh = 2000, needs roughly double the panels
    expect(result.monthlyUsage).toBe(2000);
    expect(result.numberOfPanels).toBeGreaterThan(35);
  });

  // ─── Test 3: Low bill ($50) ───
  it('calculates low $50/month bill', () => {
    const result = calculateSolarPanel({
      monthlyBill: 50,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result.monthlyUsage).toBeCloseTo(333.33, 0);
    expect(result.numberOfPanels).toBeLessThan(10);
    expect(result.numberOfPanels).toBeGreaterThan(0);
  });

  // ─── Test 4: Low sun hours (3) ───
  it('requires more panels with low sun hours', () => {
    const highSun = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 7,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 100,
    });
    const lowSun = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 3,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 100,
    });
    expect(lowSun.numberOfPanels).toBeGreaterThan(highSun.numberOfPanels as number);
  });

  // ─── Test 5: High sun hours (7) ───
  it('requires fewer panels with high sun hours', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 7,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result.numberOfPanels).toBeLessThan(21);
  });

  // ─── Test 6: Large panels (500W) ───
  it('requires fewer large (500W) panels', () => {
    const small = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 5,
      panelWattage: 300, systemEfficiency: 80, electricityOffset: 100,
    });
    const large = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 5,
      panelWattage: 500, systemEfficiency: 80, electricityOffset: 100,
    });
    expect(large.numberOfPanels).toBeLessThan(small.numberOfPanels as number);
  });

  // ─── Test 7: Small panels (300W) ───
  it('requires more small (300W) panels', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 300,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result.numberOfPanels).toBeGreaterThan(21);
  });

  // ─── Test 8: Partial offset (80%) ───
  it('calculates 80% offset correctly', () => {
    const full = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 5,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 100,
    });
    const partial = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 5,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 80,
    });
    expect(partial.numberOfPanels).toBeLessThan(full.numberOfPanels as number);
  });

  // ─── Test 9: Low efficiency (60%) ───
  it('requires more panels with low efficiency', () => {
    const highEff = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 5,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 100,
    });
    const lowEff = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.15, sunHours: 5,
      panelWattage: 400, systemEfficiency: 60, electricityOffset: 100,
    });
    expect(lowEff.numberOfPanels).toBeGreaterThan(highEff.numberOfPanels as number);
  });

  // ─── Test 10: Zero bill returns zeros ───
  it('returns zeros for $0 bill', () => {
    const result = calculateSolarPanel({
      monthlyBill: 0,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result.numberOfPanels).toBe(0);
    expect(result.systemSizeKW).toBe(0);
    expect(result.annualProduction).toBe(0);
    expect(result.annualSavings).toBe(0);
    expect(result.paybackYears).toBe(0);
  });

  // ─── Test 11: Panel count is always a whole number ───
  it('returns whole number for panel count', () => {
    const result = calculateSolarPanel({
      monthlyBill: 175,
      electricityRate: 0.12,
      sunHours: 4.5,
      panelWattage: 350,
      systemEfficiency: 75,
      electricityOffset: 90,
    });
    expect(Number.isInteger(result.numberOfPanels)).toBe(true);
    expect(result.numberOfPanels).toBeGreaterThan(0);
  });

  // ─── Test 12: System size matches panel count × wattage ───
  it('system size equals panels × wattage / 1000', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    const expectedKW = (result.numberOfPanels as number) * 400 / 1000;
    expect(result.systemSizeKW).toBeCloseTo(expectedKW, 2);
  });

  // ─── Test 13: Annual production is reasonable ───
  it('annual production is within expected range', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    // Should produce close to 12,000 kWh/year to offset $150/mo at $0.15/kWh
    expect(result.annualProduction).toBeGreaterThan(11000);
    expect(result.annualProduction).toBeLessThan(14000);
  });

  // ─── Test 14: Annual savings ───
  it('calculates annual savings correctly', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    // Savings = min(production, annualKWh) × rate
    // Should be close to $1,800/year (12000 kWh × $0.15)
    expect(result.annualSavings).toBeGreaterThan(1700);
    expect(result.annualSavings).toBeLessThan(1900);
  });

  // ─── Test 15: Payback years are reasonable ───
  it('payback period is between 5 and 15 years for typical setup', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result.paybackYears).toBeGreaterThan(5);
    expect(result.paybackYears).toBeLessThan(15);
  });

  // ─── Test 16: Federal tax credit is 30% of system cost ───
  it('federal tax credit is 30% of midpoint system cost', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    const costGroup = result.costEstimate as Array<{ label: string; value: number }>;
    const costLow = costGroup[0].value;
    const costHigh = costGroup[1].value;
    const midCost = (costLow + costHigh) / 2;
    expect(result.federalTaxCredit).toBeCloseTo(midCost * 0.30, 0);
  });

  // ─── Test 17: 25-year savings structure ───
  it('returns 25-year savings value group', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    const savings = result.twentyFiveYearSavings as Array<{ label: string; value: number }>;
    expect(savings).toHaveLength(3);
    expect(savings[0].label).toBe('Total Energy Savings');
    expect(savings[0].value).toBeCloseTo((result.annualSavings as number) * 25, 0);
    // Net profit should be positive for typical setups
    expect(savings[2].value).toBeGreaterThan(0);
  });

  // ─── Test 18: Cost structure has 5 items ───
  it('cost estimate value group has correct structure', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    const costGroup = result.costEstimate as Array<{ label: string; value: number }>;
    expect(costGroup).toHaveLength(5);
    expect(costGroup[0].label).toContain('Low');
    expect(costGroup[1].label).toContain('High');
    expect(costGroup[2].label).toContain('Tax Credit');
    expect(costGroup[3].label).toContain('Net Cost (Low)');
    expect(costGroup[4].label).toContain('Net Cost (High)');
    // Low cost < High cost
    expect(costGroup[0].value).toBeLessThan(costGroup[1].value);
    // Net cost < system cost
    expect(costGroup[3].value).toBeLessThan(costGroup[0].value);
  });

  // ─── Test 19: Output structure contains all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateSolarPanel({
      monthlyBill: 150,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result).toHaveProperty('numberOfPanels');
    expect(result).toHaveProperty('systemSizeKW');
    expect(result).toHaveProperty('annualProduction');
    expect(result).toHaveProperty('monthlyUsage');
    expect(result).toHaveProperty('annualSavings');
    expect(result).toHaveProperty('paybackYears');
    expect(result).toHaveProperty('federalTaxCredit');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('twentyFiveYearSavings');
  });

  // ─── Test 20: Very high bill ($500) still produces valid results ───
  it('handles very high $500/month bill', () => {
    const result = calculateSolarPanel({
      monthlyBill: 500,
      electricityRate: 0.15,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    expect(result.numberOfPanels).toBeGreaterThan(50);
    expect(result.annualSavings).toBeGreaterThan(5000);
  });

  // ─── Test 21: High electricity rate increases payback ───
  it('higher electricity rate decreases payback period', () => {
    const lowRate = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.10, sunHours: 5,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 100,
    });
    const highRate = calculateSolarPanel({
      monthlyBill: 150, electricityRate: 0.30, sunHours: 5,
      panelWattage: 400, systemEfficiency: 80, electricityOffset: 100,
    });
    // Higher rate = fewer panels needed for same bill, lower cost, same savings $/yr
    // Actually higher rate = fewer kWh used, smaller system, but savings/kWh higher
    // Payback should be shorter with higher rates since $/kWh saved is higher
    expect(highRate.paybackYears).toBeLessThan(lowRate.paybackYears as number);
  });

  // ─── Test 22: Monthly usage calculation ───
  it('calculates monthly kWh usage correctly', () => {
    const result = calculateSolarPanel({
      monthlyBill: 200,
      electricityRate: 0.20,
      sunHours: 5,
      panelWattage: 400,
      systemEfficiency: 80,
      electricityOffset: 100,
    });
    // monthlyKWh = 200 / 0.20 = 1000
    expect(result.monthlyUsage).toBe(1000);
  });
});
