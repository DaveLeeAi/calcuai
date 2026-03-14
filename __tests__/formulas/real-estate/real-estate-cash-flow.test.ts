import { calculateRealEstateCashFlow } from '@/lib/formulas/real-estate/real-estate-cash-flow';

describe('calculateRealEstateCashFlow', () => {
  it('calculates gross rental income correctly', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 0, propertyTaxMonthly: 0, insuranceMonthly: 0, maintenanceMonthly: 0, propertyManagementPercent: 0, otherExpensesMonthly: 0, monthlyMortgagePayment: 0, totalCashInvested: 50000 });
    expect(result.grossRentalIncome).toBe(24000);
  });

  it('applies vacancy rate to effective gross income', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 5, propertyTaxMonthly: 0, insuranceMonthly: 0, maintenanceMonthly: 0, propertyManagementPercent: 0, otherExpensesMonthly: 0, monthlyMortgagePayment: 0, totalCashInvested: 50000 });
    expect(Number(result.effectiveGrossIncome)).toBeCloseTo(24000 * 0.95, 2);
  });

  it('calculates NOI without mortgage', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 0, propertyTaxMonthly: 200, insuranceMonthly: 100, maintenanceMonthly: 150, propertyManagementPercent: 0, otherExpensesMonthly: 50, monthlyMortgagePayment: 0, totalCashInvested: 50000 });
    const annualExpenses = (200 + 100 + 150 + 50) * 12;
    expect(Number(result.noi)).toBeCloseTo(24000 - annualExpenses, 0);
  });

  it('subtracts mortgage from NOI to get cash flow', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 0, propertyTaxMonthly: 0, insuranceMonthly: 0, maintenanceMonthly: 0, propertyManagementPercent: 0, otherExpensesMonthly: 0, monthlyMortgagePayment: 1200, totalCashInvested: 50000 });
    expect(Number(result.annualCashFlow)).toBeCloseTo(24000 - 14400, 0);
    expect(Number(result.monthlyCashFlow)).toBeCloseTo((24000 - 14400) / 12, 0);
  });

  it('calculates cash-on-cash return', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 0, propertyTaxMonthly: 0, insuranceMonthly: 0, maintenanceMonthly: 0, propertyManagementPercent: 0, otherExpensesMonthly: 0, monthlyMortgagePayment: 1200, totalCashInvested: 60000 });
    const annualCF = 24000 - 14400;
    expect(Number(result.cashOnCashReturn)).toBeCloseTo((annualCF / 60000) * 100, 1);
  });

  it('handles property management fee as percent of rent', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 0, propertyTaxMonthly: 0, insuranceMonthly: 0, maintenanceMonthly: 0, propertyManagementPercent: 10, otherExpensesMonthly: 0, monthlyMortgagePayment: 0, totalCashInvested: 50000 });
    expect(Number(result.totalOperatingExpenses)).toBeCloseTo(2400, 0); // 10% of 24000
  });

  it('produces negative cash flow when expenses exceed income', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 1000, vacancyRatePercent: 20, propertyTaxMonthly: 300, insuranceMonthly: 200, maintenanceMonthly: 200, propertyManagementPercent: 10, otherExpensesMonthly: 100, monthlyMortgagePayment: 1500, totalCashInvested: 50000 });
    expect(Number(result.monthlyCashFlow)).toBeLessThan(0);
  });

  it('caps vacancy rate at 50%', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 100, propertyTaxMonthly: 0, insuranceMonthly: 0, maintenanceMonthly: 0, propertyManagementPercent: 0, otherExpensesMonthly: 0, monthlyMortgagePayment: 0, totalCashInvested: 50000 });
    expect(Number(result.effectiveGrossIncome)).toBeCloseTo(12000, 0); // 50% cap
  });

  it('returns summary array', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 5, propertyTaxMonthly: 200, insuranceMonthly: 100, maintenanceMonthly: 100, propertyManagementPercent: 8, otherExpensesMonthly: 50, monthlyMortgagePayment: 1200, totalCashInvested: 60000 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(8);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateRealEstateCashFlow({});
    expect(typeof result.monthlyCashFlow).toBe('number');
  });

  it('expense ratio is between 0 and 100', () => {
    const result = calculateRealEstateCashFlow({ monthlyRent: 2000, vacancyRatePercent: 5, propertyTaxMonthly: 200, insuranceMonthly: 100, maintenanceMonthly: 100, propertyManagementPercent: 8, otherExpensesMonthly: 50, monthlyMortgagePayment: 1200, totalCashInvested: 60000 });
    expect(Number(result.expenseRatio)).toBeGreaterThanOrEqual(0);
    expect(Number(result.expenseRatio)).toBeLessThanOrEqual(100);
  });
});
