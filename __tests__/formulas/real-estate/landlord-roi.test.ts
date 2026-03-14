import { calculateLandlordROI } from '@/lib/formulas/real-estate/landlord-roi';

describe('calculateLandlordROI', () => {
  it('calculates total ROI correctly', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 3600, annualPrincipalPaydown: 3000, currentPropertyValue: 350000, purchasePrice: 300000, annualTaxBenefits: 2000, holdingYears: 5 });
    const totalReturn = (3600 + 3000 + 2000) * 5 + (350000 - 300000);
    const expectedROI = (totalReturn / 60000) * 100;
    expect(Number(result.totalROI)).toBeCloseTo(expectedROI, 1);
  });

  it('calculates cash-on-cash ROI correctly', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 4800, annualPrincipalPaydown: 0, currentPropertyValue: 300000, purchasePrice: 300000, annualTaxBenefits: 0, holdingYears: 1 });
    expect(Number(result.cashOnCashROI)).toBeCloseTo((4800 / 60000) * 100, 2);
  });

  it('calculates appreciation gain', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 0, annualPrincipalPaydown: 0, currentPropertyValue: 400000, purchasePrice: 300000, annualTaxBenefits: 0, holdingYears: 5 });
    expect(result.appreciationGain).toBe(100000);
  });

  it('returns zero appreciation when value did not increase', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 3600, annualPrincipalPaydown: 2000, currentPropertyValue: 250000, purchasePrice: 300000, annualTaxBenefits: 0, holdingYears: 5 });
    expect(result.appreciationGain).toBe(0);
  });

  it('calculates annualized ROI', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 3600, annualPrincipalPaydown: 3000, currentPropertyValue: 350000, purchasePrice: 300000, annualTaxBenefits: 2000, holdingYears: 5 });
    expect(Number(result.annualizedROI)).toBeCloseTo(Number(result.totalROI) / 5, 1);
  });

  it('returns roiBreakdown with 4 components', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 3600, annualPrincipalPaydown: 3000, currentPropertyValue: 350000, purchasePrice: 300000, annualTaxBenefits: 2000, holdingYears: 5 });
    const breakdown = result.roiBreakdown as unknown[];
    expect(Array.isArray(breakdown)).toBe(true);
    expect(breakdown.length).toBe(4);
  });

  it('handles zero tax benefits', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 3600, annualPrincipalPaydown: 3000, currentPropertyValue: 330000, purchasePrice: 300000, annualTaxBenefits: 0, holdingYears: 5 });
    expect(typeof result.totalROI).toBe('number');
  });

  it('handles negative cash flow scenario', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: -2400, annualPrincipalPaydown: 3000, currentPropertyValue: 380000, purchasePrice: 300000, annualTaxBenefits: 1500, holdingYears: 5 });
    expect(typeof result.totalROI).toBe('number');
    expect(typeof result.totalCumulativeReturn).toBe('number');
  });

  it('returns summary array with 6 items', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 3600, annualPrincipalPaydown: 3000, currentPropertyValue: 350000, purchasePrice: 300000, annualTaxBenefits: 2000, holdingYears: 5 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateLandlordROI({});
    expect(typeof result.totalROI).toBe('number');
  });

  it('handles 1-year holding period', () => {
    const result = calculateLandlordROI({ totalCashInvested: 60000, annualCashFlow: 6000, annualPrincipalPaydown: 2000, currentPropertyValue: 310000, purchasePrice: 300000, annualTaxBenefits: 1000, holdingYears: 1 });
    const totalReturn = 6000 + 2000 + 10000 + 1000;
    expect(Number(result.totalROI)).toBeCloseTo((totalReturn / 60000) * 100, 1);
  });
});
