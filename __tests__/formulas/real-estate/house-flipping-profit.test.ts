import { calculateHouseFlippingProfit } from '@/lib/formulas/real-estate/house-flipping-profit';

describe('calculateHouseFlippingProfit', () => {
  it('calculates net profit correctly', () => {
    const result = calculateHouseFlippingProfit({ arv: 300000, purchasePrice: 150000, rehabCost: 50000, holdingMonths: 6, monthlyHoldingCost: 1500, buyingClosingCostPercent: 2, sellingClosingCostPercent: 8 });
    const buyClose = 150000 * 0.02;
    const holding = 6 * 1500;
    const totalInv = 150000 + 50000 + holding + buyClose;
    const sellCosts = 300000 * 0.08;
    const expected = 300000 - totalInv - sellCosts;
    expect(Number(result.netProfit)).toBeCloseTo(expected, 0);
  });

  it('calculates ROI correctly', () => {
    const result = calculateHouseFlippingProfit({ arv: 300000, purchasePrice: 150000, rehabCost: 50000, holdingMonths: 6, monthlyHoldingCost: 0, buyingClosingCostPercent: 0, sellingClosingCostPercent: 0 });
    const totalInv = 200000;
    const profit = 300000 - 200000;
    const expectedROI = (profit / totalInv) * 100;
    expect(Number(result.roi)).toBeCloseTo(expectedROI, 1);
  });

  it('calculates 70% rule max allowable offer', () => {
    const result = calculateHouseFlippingProfit({ arv: 300000, purchasePrice: 150000, rehabCost: 30000, holdingMonths: 6, monthlyHoldingCost: 0, buyingClosingCostPercent: 0, sellingClosingCostPercent: 0 });
    const mao = 300000 * 0.70 - 30000;
    expect(Number(result.maxAllowableOffer)).toBeCloseTo(mao, 0);
  });

  it('returns zero MAO when rehab exceeds 70% ARV', () => {
    const result = calculateHouseFlippingProfit({ arv: 100000, purchasePrice: 50000, rehabCost: 80000, holdingMonths: 6, monthlyHoldingCost: 0, buyingClosingCostPercent: 0, sellingClosingCostPercent: 0 });
    expect(Number(result.maxAllowableOffer)).toBe(0);
  });

  it('handles losing deal (negative profit)', () => {
    const result = calculateHouseFlippingProfit({ arv: 200000, purchasePrice: 190000, rehabCost: 30000, holdingMonths: 12, monthlyHoldingCost: 2000, buyingClosingCostPercent: 3, sellingClosingCostPercent: 9 });
    expect(Number(result.netProfit)).toBeLessThan(0);
  });

  it('calculates annualized ROI for 6-month flip', () => {
    const result = calculateHouseFlippingProfit({ arv: 300000, purchasePrice: 180000, rehabCost: 40000, holdingMonths: 6, monthlyHoldingCost: 0, buyingClosingCostPercent: 0, sellingClosingCostPercent: 0 });
    expect(typeof result.annualizedRoi).toBe('number');
    // Annualized should be higher than raw ROI for < 12 month holds with positive profit
    if (Number(result.roi) > 0) {
      expect(Number(result.annualizedRoi)).toBeGreaterThanOrEqual(Number(result.roi));
    }
  });

  it('includes totalInvestment in result', () => {
    const result = calculateHouseFlippingProfit({ arv: 300000, purchasePrice: 150000, rehabCost: 50000, holdingMonths: 6, monthlyHoldingCost: 1000, buyingClosingCostPercent: 2, sellingClosingCostPercent: 8 });
    expect(Number(result.totalInvestment)).toBeGreaterThan(200000);
  });

  it('handles zero holding costs', () => {
    const result = calculateHouseFlippingProfit({ arv: 250000, purchasePrice: 150000, rehabCost: 30000, holdingMonths: 3, monthlyHoldingCost: 0, buyingClosingCostPercent: 0, sellingClosingCostPercent: 0 });
    expect(Number(result.totalInvestment)).toBe(180000);
  });

  it('returns summary array', () => {
    const result = calculateHouseFlippingProfit({ arv: 300000, purchasePrice: 150000, rehabCost: 50000, holdingMonths: 6, monthlyHoldingCost: 1000, buyingClosingCostPercent: 2, sellingClosingCostPercent: 8 });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(7);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateHouseFlippingProfit({});
    expect(typeof result.netProfit).toBe('number');
  });

  it('typical profitable flip scenario', () => {
    const result = calculateHouseFlippingProfit({ arv: 350000, purchasePrice: 180000, rehabCost: 55000, holdingMonths: 5, monthlyHoldingCost: 1800, buyingClosingCostPercent: 2, sellingClosingCostPercent: 8 });
    expect(Number(result.netProfit)).toBeGreaterThan(0);
    expect(Number(result.roi)).toBeGreaterThan(0);
  });
});
