import { calculateCommission } from '@/lib/formulas/business/commission';

describe('calculateCommission', () => {
  // ─── Test 1: Flat rate commission ($50,000 at 10%) ───
  it('calculates flat rate commission correctly', () => {
    const result = calculateCommission({
      salesAmount: 50000,
      commissionStructure: 'flat',
      flatRate: 10,
      basePay: 0,
    });
    // Commission: $50,000 × 10% = $5,000
    expect(result.commissionAmount).toBe(5000);
    expect(result.totalEarnings).toBe(5000);
  });

  // ─── Test 2: Flat rate with base pay ───
  it('calculates flat rate commission with base pay', () => {
    const result = calculateCommission({
      salesAmount: 80000,
      commissionStructure: 'flat',
      flatRate: 10,
      basePay: 3000,
    });
    // Commission: $80,000 × 10% = $8,000
    // Total: $3,000 + $8,000 = $11,000
    expect(result.commissionAmount).toBe(8000);
    expect(result.totalEarnings).toBe(11000);
  });

  // ─── Test 3: Tiered — sales below tier 1 threshold ───
  it('calculates tiered commission for sales within tier 1', () => {
    const result = calculateCommission({
      salesAmount: 15000,
      commissionStructure: 'tiered',
      basePay: 0,
      tier1Threshold: 25000,
      tier1Rate: 5,
      tier2Threshold: 50000,
      tier2Rate: 8,
      tier3Rate: 12,
    });
    // All $15,000 falls in Tier 1: $15,000 × 5% = $750
    expect(result.commissionAmount).toBe(750);
    expect(result.totalEarnings).toBe(750);
  });

  // ─── Test 4: Tiered — sales between tier 1 and tier 2 ───
  it('calculates tiered commission for sales spanning tier 1 and tier 2', () => {
    const result = calculateCommission({
      salesAmount: 40000,
      commissionStructure: 'tiered',
      basePay: 0,
      tier1Threshold: 25000,
      tier1Rate: 5,
      tier2Threshold: 50000,
      tier2Rate: 8,
      tier3Rate: 12,
    });
    // Tier 1: $25,000 × 5% = $1,250
    // Tier 2: $15,000 × 8% = $1,200
    // Total: $2,450
    expect(result.commissionAmount).toBe(2450);
  });

  // ─── Test 5: Tiered — sales above all tiers ($100,000) ───
  it('calculates tiered commission for sales above all tiers', () => {
    const result = calculateCommission({
      salesAmount: 100000,
      commissionStructure: 'tiered',
      basePay: 0,
      tier1Threshold: 25000,
      tier1Rate: 5,
      tier2Threshold: 50000,
      tier2Rate: 8,
      tier3Rate: 12,
    });
    // Tier 1: $25,000 × 5% = $1,250
    // Tier 2: $25,000 × 8% = $2,000
    // Tier 3: $50,000 × 12% = $6,000
    // Total: $9,250
    expect(result.commissionAmount).toBe(9250);
  });

  // ─── Test 6: Zero sales amount ───
  it('handles zero sales amount gracefully', () => {
    const result = calculateCommission({
      salesAmount: 0,
      commissionStructure: 'flat',
      flatRate: 10,
      basePay: 3000,
    });
    expect(result.commissionAmount).toBe(0);
    expect(result.totalEarnings).toBe(3000);
    expect(result.effectiveCommissionRate).toBe(0);
  });

  // ─── Test 7: Zero commission rate ───
  it('handles zero commission rate', () => {
    const result = calculateCommission({
      salesAmount: 50000,
      commissionStructure: 'flat',
      flatRate: 0,
      basePay: 2000,
    });
    expect(result.commissionAmount).toBe(0);
    expect(result.totalEarnings).toBe(2000);
  });

  // ─── Test 8: 100% commission rate ───
  it('handles 100% commission rate', () => {
    const result = calculateCommission({
      salesAmount: 25000,
      commissionStructure: 'flat',
      flatRate: 100,
      basePay: 0,
    });
    expect(result.commissionAmount).toBe(25000);
    expect(result.totalEarnings).toBe(25000);
  });

  // ─── Test 9: Very high sales ($10M) ───
  it('handles very high sales amounts', () => {
    const result = calculateCommission({
      salesAmount: 10000000,
      commissionStructure: 'flat',
      flatRate: 3,
      basePay: 5000,
    });
    // Commission: $10M × 3% = $300,000
    // Total: $5,000 + $300,000 = $305,000
    expect(result.commissionAmount).toBe(300000);
    expect(result.totalEarnings).toBe(305000);
  });

  // ─── Test 10: Effective commission rate calculation ───
  it('calculates effective commission rate correctly', () => {
    const result = calculateCommission({
      salesAmount: 80000,
      commissionStructure: 'flat',
      flatRate: 10,
      basePay: 3000,
    });
    // Commission: $8,000 / $80,000 × 100 = 10%
    expect(result.effectiveCommissionRate).toBe(10);
  });

  // ─── Test 11: Tiered breakdown table correct ───
  it('returns correct tier breakdown table for tiered structure', () => {
    const result = calculateCommission({
      salesAmount: 100000,
      commissionStructure: 'tiered',
      basePay: 0,
      tier1Threshold: 25000,
      tier1Rate: 5,
      tier2Threshold: 50000,
      tier2Rate: 8,
      tier3Rate: 12,
    });
    const breakdown = result.tierBreakdown as { tier: string; rate: number; commissionEarned: number }[];
    expect(breakdown).toHaveLength(3);
    expect(breakdown[0].tier).toBe('Tier 1');
    expect(breakdown[0].rate).toBe(5);
    expect(breakdown[0].commissionEarned).toBe(1250);
    expect(breakdown[1].tier).toBe('Tier 2');
    expect(breakdown[1].rate).toBe(8);
    expect(breakdown[1].commissionEarned).toBe(2000);
    expect(breakdown[2].tier).toBe('Tier 3');
    expect(breakdown[2].rate).toBe(12);
    expect(breakdown[2].commissionEarned).toBe(6000);
  });

  // ─── Test 12: Earnings breakdown pie chart data ───
  it('returns earnings breakdown with correct segments', () => {
    const result = calculateCommission({
      salesAmount: 50000,
      commissionStructure: 'flat',
      flatRate: 10,
      basePay: 3000,
    });
    const breakdown = result.earningsBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(2);
    expect(breakdown[0]).toEqual({ label: 'Base Pay', value: 3000 });
    expect(breakdown[1]).toEqual({ label: 'Commission', value: 5000 });
  });

  // ─── Test 13: No base pay, flat commission only ───
  it('calculates flat commission with zero base pay', () => {
    const result = calculateCommission({
      salesAmount: 60000,
      commissionStructure: 'flat',
      flatRate: 15,
      basePay: 0,
    });
    // Commission: $60,000 × 15% = $9,000
    expect(result.commissionAmount).toBe(9000);
    expect(result.totalEarnings).toBe(9000);
  });

  // ─── Test 14: Summary contains correct labels ───
  it('returns summary with all expected labels', () => {
    const result = calculateCommission({
      salesAmount: 50000,
      commissionStructure: 'flat',
      flatRate: 10,
      basePay: 2000,
    });
    const summary = result.summary as { label: string; value: number }[];
    const labels = summary.map((s) => s.label);
    expect(labels).toContain('Commission Amount');
    expect(labels).toContain('Base Pay');
    expect(labels).toContain('Total Earnings');
    expect(labels).toContain('Effective Commission Rate');
    expect(labels).toContain('Sales Amount');
  });

  // ─── Test 15: Missing inputs use safe defaults ───
  it('uses defaults for missing inputs', () => {
    const result = calculateCommission({});
    expect(result.commissionAmount).toBe(0);
    expect(result.totalEarnings).toBe(0);
    expect(result.effectiveCommissionRate).toBe(0);
  });

  // ─── Test 16: Tiered with base pay ───
  it('calculates tiered commission with base pay', () => {
    const result = calculateCommission({
      salesAmount: 100000,
      commissionStructure: 'tiered',
      basePay: 4000,
      tier1Threshold: 25000,
      tier1Rate: 5,
      tier2Threshold: 50000,
      tier2Rate: 8,
      tier3Rate: 12,
    });
    // Commission: $1,250 + $2,000 + $6,000 = $9,250
    // Total: $4,000 + $9,250 = $13,250
    expect(result.commissionAmount).toBe(9250);
    expect(result.totalEarnings).toBe(13250);
  });
});
