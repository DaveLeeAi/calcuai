import { calculateCustomerLifetimeValue } from '@/lib/formulas/business/customer-lifetime-value';

describe('calculateCustomerLifetimeValue', () => {
  // ─── Test 1: Simple CLV with defaults ───
  it('calculates simple CLV with default-like values', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 50,
      purchaseFrequency: 12,
      customerLifespan: 5,
      acquisitionCost: 200,
    });
    // CLV = 50 × 12 × 5 = 3000
    expect(result.clv).toBe(3000);
  });

  // ─── Test 2: Net CLV calculation ───
  it('calculates net CLV correctly', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 50,
      purchaseFrequency: 12,
      customerLifespan: 5,
      acquisitionCost: 200,
    });
    // Net CLV = 3000 - 200 = 2800
    expect(result.netCLV).toBe(2800);
  });

  // ─── Test 3: CLV:CAC ratio ───
  it('calculates CLV:CAC ratio', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 50,
      purchaseFrequency: 12,
      customerLifespan: 5,
      acquisitionCost: 200,
    });
    // Ratio = 3000 / 200 = 15.0
    expect(result.clvToCAC).toBe(15);
  });

  // ─── Test 4: Annual customer value (simple) ───
  it('calculates annual value for simple mode', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 75,
      purchaseFrequency: 4,
      customerLifespan: 3,
      acquisitionCost: 100,
    });
    // Annual = 75 × 4 = 300
    expect(result.annualValue).toBe(300);
    // CLV = 75 × 4 × 3 = 900
    expect(result.clv).toBe(900);
  });

  // ─── Test 5: Subscription CLV ───
  it('calculates subscription CLV correctly', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 99,
      grossMarginPercent: 70,
      monthlyChurnRate: 5,
      acquisitionCost: 200,
    });
    // CLV = (99 × 0.70) / 0.05 = 69.3 / 0.05 = 1386
    expect(result.clv).toBe(1386);
  });

  // ─── Test 6: Subscription annual value ───
  it('calculates annual value for subscription mode', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 99,
      grossMarginPercent: 70,
      monthlyChurnRate: 5,
      acquisitionCost: 200,
    });
    // Annual value = 99 × 12 = 1188
    expect(result.annualValue).toBe(1188);
  });

  // ─── Test 7: Subscription net CLV ───
  it('calculates subscription net CLV', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 99,
      grossMarginPercent: 70,
      monthlyChurnRate: 5,
      acquisitionCost: 200,
    });
    // Net = 1386 - 200 = 1186
    expect(result.netCLV).toBe(1186);
  });

  // ─── Test 8: High churn rate reduces CLV ───
  it('produces lower CLV with higher churn', () => {
    const low = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 100,
      grossMarginPercent: 80,
      monthlyChurnRate: 2,
      acquisitionCost: 0,
    });
    const high = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 100,
      grossMarginPercent: 80,
      monthlyChurnRate: 10,
      acquisitionCost: 0,
    });
    expect(Number(low.clv)).toBeGreaterThan(Number(high.clv));
  });

  // ─── Test 9: Zero acquisition cost ───
  it('handles zero acquisition cost', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 100,
      purchaseFrequency: 10,
      customerLifespan: 3,
      acquisitionCost: 0,
    });
    expect(result.clv).toBe(3000);
    expect(result.netCLV).toBe(3000);
    expect(result.clvToCAC).toBe(0); // division by zero → 0
  });

  // ─── Test 10: Zero purchase value ───
  it('handles zero average purchase value', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 0,
      purchaseFrequency: 12,
      customerLifespan: 5,
      acquisitionCost: 200,
    });
    expect(result.clv).toBe(0);
    expect(result.netCLV).toBe(-200);
  });

  // ─── Test 11: Zero churn rate (subscription) ───
  it('handles zero churn rate in subscription mode', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 99,
      grossMarginPercent: 70,
      monthlyChurnRate: 0,
      acquisitionCost: 200,
    });
    // Division by zero → CLV = 0
    expect(result.clv).toBe(0);
  });

  // ─── Test 12: Very small churn rate ───
  it('produces very high CLV with tiny churn', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 50,
      grossMarginPercent: 80,
      monthlyChurnRate: 0.5,
      acquisitionCost: 100,
    });
    // CLV = (50 × 0.80) / 0.005 = 40 / 0.005 = 8000
    expect(result.clv).toBe(8000);
  });

  // ─── Test 13: String input coercion ───
  it('coerces string inputs to numbers', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: '100',
      purchaseFrequency: '6',
      customerLifespan: '2',
      acquisitionCost: '150',
    });
    // CLV = 100 × 6 × 2 = 1200
    expect(result.clv).toBe(1200);
    expect(result.netCLV).toBe(1050);
  });

  // ─── Test 14: Missing inputs default to zero ───
  it('defaults missing inputs to safe values', () => {
    const result = calculateCustomerLifetimeValue({});
    expect(result.clv).toBe(0);
    expect(result.netCLV).toBe(0);
    expect(result.clvToCAC).toBe(0);
  });

  // ─── Test 15: Very large CLV ───
  it('handles very large purchase values', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 50000,
      purchaseFrequency: 1,
      customerLifespan: 20,
      acquisitionCost: 10000,
    });
    // CLV = 50000 × 1 × 20 = 1,000,000
    expect(result.clv).toBe(1000000);
    expect(result.netCLV).toBe(990000);
  });

  // ─── Test 16: CLV:CAC ratio for subscription ───
  it('calculates CLV:CAC ratio for subscription mode', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 100,
      grossMarginPercent: 80,
      monthlyChurnRate: 4,
      acquisitionCost: 500,
    });
    // CLV = (100 × 0.80) / 0.04 = 2000
    // Ratio = 2000 / 500 = 4.0
    expect(result.clv).toBe(2000);
    expect(result.clvToCAC).toBe(4);
  });

  // ─── Test 17: Negative net CLV ───
  it('returns negative net CLV when CAC exceeds CLV', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 10,
      purchaseFrequency: 2,
      customerLifespan: 1,
      acquisitionCost: 500,
    });
    // CLV = 10 × 2 × 1 = 20
    // Net = 20 - 500 = -480
    expect(result.clv).toBe(20);
    expect(result.netCLV).toBe(-480);
  });

  // ─── Test 18: Summary contains expected labels ───
  it('returns summary with expected labels for simple mode', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 50,
      purchaseFrequency: 12,
      customerLifespan: 5,
      acquisitionCost: 200,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Customer Lifetime Value');
    expect(labels).toContain('Acquisition Cost (CAC)');
    expect(labels).toContain('Net CLV');
    expect(labels).toContain('CLV:CAC Ratio');
    expect(labels).toContain('Annual Customer Value');
  });

  // ─── Test 19: Subscription summary includes lifespan ───
  it('includes average lifespan in subscription summary', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 99,
      grossMarginPercent: 70,
      monthlyChurnRate: 5,
      acquisitionCost: 200,
    });
    const summary = result.summary as { label: string; value: number | string }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Avg Customer Lifespan');
    // 1 / 0.05 = 20 months
    const lifespanEntry = summary.find((s) => s.label === 'Avg Customer Lifespan');
    expect(lifespanEntry?.value).toBe('20 months');
  });

  // ─── Test 20: 100% gross margin subscription ───
  it('handles 100% gross margin', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 50,
      grossMarginPercent: 100,
      monthlyChurnRate: 10,
      acquisitionCost: 100,
    });
    // CLV = (50 × 1.0) / 0.10 = 500
    expect(result.clv).toBe(500);
  });

  // ─── Test 21: Zero gross margin ───
  it('handles zero gross margin', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'subscription',
      monthlyRevenue: 99,
      grossMarginPercent: 0,
      monthlyChurnRate: 5,
      acquisitionCost: 200,
    });
    // CLV = (99 × 0) / 0.05 = 0
    expect(result.clv).toBe(0);
  });

  // ─── Test 22: Single purchase customer ───
  it('calculates CLV for single annual purchase', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 500,
      purchaseFrequency: 1,
      customerLifespan: 10,
      acquisitionCost: 50,
    });
    // CLV = 500 × 1 × 10 = 5000
    expect(result.clv).toBe(5000);
    expect(result.annualValue).toBe(500);
  });

  // ─── Test 23: All output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 50,
      purchaseFrequency: 12,
      customerLifespan: 5,
      acquisitionCost: 200,
    });
    expect(result).toHaveProperty('clv');
    expect(result).toHaveProperty('netCLV');
    expect(result).toHaveProperty('clvToCAC');
    expect(result).toHaveProperty('annualValue');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 24: Fractional lifespan ───
  it('handles fractional customer lifespan', () => {
    const result = calculateCustomerLifetimeValue({
      calculationMode: 'simple',
      avgPurchaseValue: 100,
      purchaseFrequency: 12,
      customerLifespan: 2.5,
      acquisitionCost: 0,
    });
    // CLV = 100 × 12 × 2.5 = 3000
    expect(result.clv).toBe(3000);
  });
});
