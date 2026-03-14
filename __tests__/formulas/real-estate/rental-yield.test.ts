import { calculateRentalYield } from '@/lib/formulas/real-estate/rental-yield';

describe('calculateRentalYield', () => {
  it('calculates gross yield correctly', () => {
    const result = calculateRentalYield({ propertyValue: 200000, monthlyRent: 1500, annualPropertyTax: 0, annualInsurance: 0, annualMaintenance: 0, managementFeePercent: 0 });
    expect(result.grossYield).toBe(9);
    expect(result.annualRent).toBe(18000);
  });

  it('calculates net yield with all expenses', () => {
    const result = calculateRentalYield({ propertyValue: 300000, monthlyRent: 2000, annualPropertyTax: 3600, annualInsurance: 1200, annualMaintenance: 1200, managementFeePercent: 10 });
    expect(result.annualRent).toBe(24000);
    expect(result.annualExpenses).toBe(3600 + 1200 + 1200 + 2400); // management = 10% of 24000 = 2400
    expect(result.netYield).toBeCloseTo((24000 - 8400) / 300000 * 100, 2);
  });

  it('handles zero rent gracefully', () => {
    const result = calculateRentalYield({ propertyValue: 200000, monthlyRent: 0, annualPropertyTax: 0, annualInsurance: 0, annualMaintenance: 0, managementFeePercent: 0 });
    expect(result.grossYield).toBe(0);
    expect(result.netYield).toBe(0);
  });

  it('handles management fee at 0%', () => {
    const result = calculateRentalYield({ propertyValue: 100000, monthlyRent: 1000, annualPropertyTax: 1200, annualInsurance: 600, annualMaintenance: 600, managementFeePercent: 0 });
    expect(result.annualExpenses).toBe(2400);
    expect(result.annualNetIncome).toBe(12000 - 2400);
  });

  it('caps management fee at 50%', () => {
    const result = calculateRentalYield({ propertyValue: 100000, monthlyRent: 1000, annualPropertyTax: 0, annualInsurance: 0, annualMaintenance: 0, managementFeePercent: 100 });
    expect(result.annualExpenses).toBe(6000); // 50% of 12000
  });

  it('returns summary array with 7 items', () => {
    const result = calculateRentalYield({ propertyValue: 200000, monthlyRent: 1500, annualPropertyTax: 0, annualInsurance: 0, annualMaintenance: 0, managementFeePercent: 0 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('calculates typical US rental scenario', () => {
    const result = calculateRentalYield({ propertyValue: 350000, monthlyRent: 2500, annualPropertyTax: 4200, annualInsurance: 1400, annualMaintenance: 2100, managementFeePercent: 8 });
    expect(result.grossYield).toBeCloseTo((30000 / 350000) * 100, 1);
    const mgmtFee = 30000 * 0.08;
    const expenses = 4200 + 1400 + 2100 + mgmtFee;
    expect(result.netYield).toBeCloseTo(((30000 - expenses) / 350000) * 100, 1);
  });

  it('handles very small property value without division by zero', () => {
    const result = calculateRentalYield({ propertyValue: 1, monthlyRent: 100, annualPropertyTax: 0, annualInsurance: 0, annualMaintenance: 0, managementFeePercent: 0 });
    expect(result.grossYield).toBeGreaterThan(0);
  });

  it('returns negative net yield when expenses exceed income', () => {
    const result = calculateRentalYield({ propertyValue: 500000, monthlyRent: 500, annualPropertyTax: 10000, annualInsurance: 5000, annualMaintenance: 5000, managementFeePercent: 0 });
    expect(result.netYield).toBeLessThan(0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateRentalYield({});
    expect(typeof result.grossYield).toBe('number');
    expect(typeof result.netYield).toBe('number');
  });

  it('annual rent = monthly rent × 12', () => {
    const result = calculateRentalYield({ propertyValue: 200000, monthlyRent: 1750, annualPropertyTax: 0, annualInsurance: 0, annualMaintenance: 0, managementFeePercent: 0 });
    expect(result.annualRent).toBe(21000);
  });
});
