import { calculateCustomerAcquisitionCost } from '@/lib/formulas/business/customer-acquisition-cost';

describe('calculateCustomerAcquisitionCost', () => {
  // ─── Test 1: Basic CAC calculation ───
  it('calculates basic CAC', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 100,
    });
    // CAC = (10000 + 5000) / 50 = 300
    expect(result.cac).toBe(300);
  });

  // ─── Test 2: CAC payback period ───
  it('calculates CAC payback period', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 100,
    });
    // Payback = 300 / 100 = 3.0 months
    expect(result.cacPaybackMonths).toBe(3);
  });

  // ─── Test 3: Zero sales spend ───
  it('handles zero sales spend', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 8000,
      salesSpend: 0,
      newCustomers: 40,
      monthlyRevenuePerCustomer: 50,
    });
    // CAC = 8000 / 40 = 200
    expect(result.cac).toBe(200);
  });

  // ─── Test 4: Zero marketing spend ───
  it('handles zero marketing spend', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 0,
      salesSpend: 6000,
      newCustomers: 30,
      monthlyRevenuePerCustomer: 200,
    });
    // CAC = 6000 / 30 = 200
    expect(result.cac).toBe(200);
  });

  // ─── Test 5: Single customer ───
  it('handles single customer acquisition', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 5000,
      salesSpend: 2000,
      newCustomers: 1,
      monthlyRevenuePerCustomer: 500,
    });
    // CAC = 7000 / 1 = 7000
    expect(result.cac).toBe(7000);
    // Payback = 7000 / 500 = 14 months
    expect(result.cacPaybackMonths).toBe(14);
  });

  // ─── Test 6: Zero monthly revenue ───
  it('handles zero monthly revenue (payback = 0)', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 0,
    });
    expect(result.cac).toBe(300);
    expect(result.cacPaybackMonths).toBe(0);
  });

  // ─── Test 7: Large customer count ───
  it('handles large customer count (low CAC)', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 50000,
      salesSpend: 25000,
      newCustomers: 10000,
      monthlyRevenuePerCustomer: 50,
    });
    // CAC = 75000 / 10000 = 7.5
    expect(result.cac).toBe(7.5);
  });

  // ─── Test 8: Very high spend ───
  it('handles very high spend amounts', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 1000000,
      salesSpend: 500000,
      newCustomers: 200,
      monthlyRevenuePerCustomer: 1000,
    });
    // CAC = 1500000 / 200 = 7500
    expect(result.cac).toBe(7500);
    // Payback = 7500 / 1000 = 7.5 months
    expect(result.cacPaybackMonths).toBe(7.5);
  });

  // ─── Test 9: Cost breakdown contains total ───
  it('includes total spend in cost breakdown', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 100,
    });
    const breakdown = result.costBreakdown as { label: string; value: number | string }[];
    const totalEntry = breakdown.find((b) => b.label === 'Total Spend');
    expect(totalEntry?.value).toBe(15000);
  });

  // ─── Test 10: Cost breakdown percentages ───
  it('calculates correct marketing/sales split', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 7500,
      salesSpend: 2500,
      newCustomers: 100,
      monthlyRevenuePerCustomer: 50,
    });
    const breakdown = result.costBreakdown as { label: string; value: number | string }[];
    const marketingPct = breakdown.find((b) => b.label === 'Marketing %');
    const salesPct = breakdown.find((b) => b.label === 'Sales %');
    expect(marketingPct?.value).toBe('75%');
    expect(salesPct?.value).toBe('25%');
  });

  // ─── Test 11: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: '10000',
      salesSpend: '5000',
      newCustomers: '50',
      monthlyRevenuePerCustomer: '100',
    });
    expect(result.cac).toBe(300);
  });

  // ─── Test 12: Missing inputs ───
  it('handles missing inputs gracefully', () => {
    const result = calculateCustomerAcquisitionCost({});
    // Defaults: spend=0, customers=1, revenue=0
    expect(result.cac).toBe(0);
    expect(result.cacPaybackMonths).toBe(0);
  });

  // ─── Test 13: Fractional CAC ───
  it('rounds CAC to 2 decimal places', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 7,
      monthlyRevenuePerCustomer: 100,
    });
    // 15000 / 7 = 2142.857...
    expect(result.cac).toBeCloseTo(2142.86, 2);
  });

  // ─── Test 14: Summary contains expected labels ───
  it('returns summary with expected labels', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 100,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Customer Acquisition Cost');
    expect(labels).toContain('Total Spend');
    expect(labels).toContain('New Customers');
    expect(labels).toContain('CAC Payback Period');
    expect(labels).toContain('Monthly Revenue/Customer');
  });

  // ─── Test 15: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 5000,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 100,
    });
    expect(result).toHaveProperty('cac');
    expect(result).toHaveProperty('cacPaybackMonths');
    expect(result).toHaveProperty('costBreakdown');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 16: Equal marketing and sales spend ───
  it('calculates 50/50 split correctly', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 10000,
      salesSpend: 10000,
      newCustomers: 100,
      monthlyRevenuePerCustomer: 200,
    });
    expect(result.cac).toBe(200);
    const breakdown = result.costBreakdown as { label: string; value: number | string }[];
    const marketingPct = breakdown.find((b) => b.label === 'Marketing %');
    expect(marketingPct?.value).toBe('50%');
  });

  // ─── Test 17: Very low monthly revenue ───
  it('handles very low monthly revenue (long payback)', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 50000,
      salesSpend: 25000,
      newCustomers: 10,
      monthlyRevenuePerCustomer: 5,
    });
    // CAC = 75000/10 = 7500; Payback = 7500/5 = 1500 months
    expect(result.cac).toBe(7500);
    expect(result.cacPaybackMonths).toBe(1500);
  });

  // ─── Test 18: SaaS typical scenario ───
  it('calculates typical SaaS CAC', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 25000,
      salesSpend: 15000,
      newCustomers: 20,
      monthlyRevenuePerCustomer: 299,
    });
    // CAC = 40000/20 = 2000
    expect(result.cac).toBe(2000);
    // Payback = 2000/299 = 6.7 months
    expect(result.cacPaybackMonths).toBeCloseTo(6.7, 1);
  });

  // ─── Test 19: E-commerce scenario ───
  it('calculates typical e-commerce CAC', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 15000,
      salesSpend: 0,
      newCustomers: 500,
      monthlyRevenuePerCustomer: 50,
    });
    // CAC = 15000/500 = 30
    expect(result.cac).toBe(30);
    // Payback = 30/50 = 0.6 months
    expect(result.cacPaybackMonths).toBe(0.6);
  });

  // ─── Test 20: Negative inputs clamped ───
  it('clamps negative spend to zero', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: -5000,
      salesSpend: -2000,
      newCustomers: 10,
      monthlyRevenuePerCustomer: 100,
    });
    expect(result.cac).toBe(0);
  });

  // ─── Test 21: Both spends zero ───
  it('handles zero total spend', () => {
    const result = calculateCustomerAcquisitionCost({
      marketingSpend: 0,
      salesSpend: 0,
      newCustomers: 50,
      monthlyRevenuePerCustomer: 100,
    });
    expect(result.cac).toBe(0);
    expect(result.cacPaybackMonths).toBe(0);
  });
});
