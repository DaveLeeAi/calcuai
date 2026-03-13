import { calculateRealEstateCommission } from '@/lib/formulas/finance/real-estate-commission';

describe('calculateRealEstateCommission', () => {
  // ─── Test 1: Default values ($400K, 5.5%, 50/50 split, 70% brokerage) ───
  it('calculates commission with default values', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5.5,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    // Total: 400K × 5.5% = 22,000
    // Listing: 22K × 50% = 11,000
    // Buyer: 22K - 11K = 11,000
    // Take-home: 11K × 70% = 7,700
    expect(result.totalCommission).toBe(22000);
    expect(result.listingAgentCommission).toBe(11000);
    expect(result.buyerAgentCommission).toBe(11000);
    expect(result.listingAgentTakeHome).toBe(7700);
    expect(result.buyerAgentTakeHome).toBe(7700);
    expect(result.sellerNetProceeds).toBe(378000);
  });

  // ─── Test 2: Zero sale price ───
  it('handles zero sale price gracefully', () => {
    const result = calculateRealEstateCommission({
      salePrice: 0,
      totalCommissionRate: 5.5,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.totalCommission).toBe(0);
    expect(result.listingAgentCommission).toBe(0);
    expect(result.buyerAgentCommission).toBe(0);
    expect(result.sellerNetProceeds).toBe(0);
    expect(result.effectiveRate).toBe(0);
  });

  // ─── Test 3: Zero commission rate ───
  it('handles zero commission rate', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 0,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.totalCommission).toBe(0);
    expect(result.sellerNetProceeds).toBe(400000);
  });

  // ─── Test 4: Standard 6% commission ───
  it('calculates 6% commission correctly', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 6,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.totalCommission).toBe(24000);
    expect(result.listingAgentCommission).toBe(12000);
    expect(result.buyerAgentCommission).toBe(12000);
  });

  // ─── Test 5: Unequal agent split (60/40) ───
  it('handles 60/40 listing/buyer split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 500000,
      totalCommissionRate: 5,
      listingAgentSplit: 60,
      brokerageSplit: 70,
    });
    // Total: 25,000
    // Listing: 25K × 60% = 15,000
    // Buyer: 25K - 15K = 10,000
    expect(result.listingAgentCommission).toBe(15000);
    expect(result.buyerAgentCommission).toBe(10000);
  });

  // ─── Test 6: 100% listing agent split ───
  it('handles 100% listing agent split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
      listingAgentSplit: 100,
      brokerageSplit: 70,
    });
    expect(result.listingAgentCommission).toBe(20000);
    expect(result.buyerAgentCommission).toBe(0);
    expect(result.buyerAgentTakeHome).toBe(0);
  });

  // ─── Test 7: 0% listing agent split (all to buyer agent) ───
  it('handles 0% listing agent split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
      listingAgentSplit: 0,
      brokerageSplit: 70,
    });
    expect(result.listingAgentCommission).toBe(0);
    expect(result.buyerAgentCommission).toBe(20000);
    expect(result.listingAgentTakeHome).toBe(0);
  });

  // ─── Test 8: 100% brokerage split (agent keeps all) ───
  it('agent keeps 100% with full brokerage split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
      listingAgentSplit: 50,
      brokerageSplit: 100,
    });
    expect(result.listingAgentTakeHome).toBe(10000);
    expect(result.buyerAgentTakeHome).toBe(10000);
  });

  // ─── Test 9: 0% brokerage split (brokerage keeps all) ───
  it('brokerage keeps all with 0% agent split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
      listingAgentSplit: 50,
      brokerageSplit: 0,
    });
    expect(result.listingAgentTakeHome).toBe(0);
    expect(result.buyerAgentTakeHome).toBe(0);
  });

  // ─── Test 10: Effective rate matches total commission rate ───
  it('effective rate matches total commission rate', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5.5,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.effectiveRate).toBe(5.5);
  });

  // ─── Test 11: Low commission rate (3%) ───
  it('calculates low commission rate correctly', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 3,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.totalCommission).toBe(12000);
    expect(result.sellerNetProceeds).toBe(388000);
  });

  // ─── Test 12: Very expensive home ($2M) ───
  it('handles high-value property', () => {
    const result = calculateRealEstateCommission({
      salePrice: 2000000,
      totalCommissionRate: 5,
      listingAgentSplit: 50,
      brokerageSplit: 80,
    });
    // Total: 100K, each agent: 50K, take-home: 50K × 80% = 40K
    expect(result.totalCommission).toBe(100000);
    expect(result.listingAgentCommission).toBe(50000);
    expect(result.listingAgentTakeHome).toBe(40000);
    expect(result.sellerNetProceeds).toBe(1900000);
  });

  // ─── Test 13: Cheap property ($100K) ───
  it('handles low-value property', () => {
    const result = calculateRealEstateCommission({
      salePrice: 100000,
      totalCommissionRate: 6,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.totalCommission).toBe(6000);
    expect(result.listingAgentCommission).toBe(3000);
    expect(result.buyerAgentCommission).toBe(3000);
  });

  // ─── Test 14: Seller net proceeds = sale price - total commission ───
  it('seller net equals sale price minus total commission', () => {
    const result = calculateRealEstateCommission({
      salePrice: 350000,
      totalCommissionRate: 5.5,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    const total = result.totalCommission as number;
    expect(result.sellerNetProceeds).toBe(350000 - total);
  });

  // ─── Test 15: Commission split adds up to total ───
  it('listing + buyer commission equals total commission', () => {
    const result = calculateRealEstateCommission({
      salePrice: 500000,
      totalCommissionRate: 5.5,
      listingAgentSplit: 55,
      brokerageSplit: 70,
    });
    const listing = result.listingAgentCommission as number;
    const buyer = result.buyerAgentCommission as number;
    const total = result.totalCommission as number;
    expect(listing + buyer).toBeCloseTo(total, 2);
  });

  // ─── Test 16: Output structure has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5.5,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result).toHaveProperty('totalCommission');
    expect(result).toHaveProperty('listingAgentCommission');
    expect(result).toHaveProperty('buyerAgentCommission');
    expect(result).toHaveProperty('listingAgentTakeHome');
    expect(result).toHaveProperty('buyerAgentTakeHome');
    expect(result).toHaveProperty('sellerNetProceeds');
    expect(result).toHaveProperty('effectiveRate');
    expect(result).toHaveProperty('commissionBreakdown');
  });

  // ─── Test 17: Commission breakdown array structure ───
  it('returns commission breakdown with correct structure', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    const breakdown = result.commissionBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(5);
    expect(breakdown[0]).toEqual({ label: 'Total Commission', value: 20000 });
    expect(breakdown[1]).toEqual({ label: 'Listing Agent Share', value: 10000 });
    expect(breakdown[2]).toEqual({ label: "Buyer's Agent Share", value: 10000 });
    expect(breakdown[3]).toEqual({ label: 'Listing Agent Take-Home', value: 7000 });
    expect(breakdown[4]).toEqual({ label: "Buyer's Agent Take-Home", value: 7000 });
  });

  // ─── Test 18: Maximum commission rate (10%) ───
  it('handles maximum commission rate', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 10,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    expect(result.totalCommission).toBe(40000);
    expect(result.sellerNetProceeds).toBe(360000);
  });

  // ─── Test 19: Non-standard brokerage split (50%) ───
  it('handles 50% brokerage split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 6,
      listingAgentSplit: 50,
      brokerageSplit: 50,
    });
    // Total: 24K, each agent: 12K, take-home: 12K × 50% = 6K
    expect(result.listingAgentTakeHome).toBe(6000);
    expect(result.buyerAgentTakeHome).toBe(6000);
  });

  // ─── Test 20: Missing inputs use defaults ───
  it('handles missing inputs gracefully', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
    });
    // listingAgentSplit defaults to 50, brokerageSplit defaults to 70
    expect(result.totalCommission).toBe(20000);
    expect(result.listingAgentCommission).toBe(10000);
    expect(result.buyerAgentCommission).toBe(10000);
    expect(result.listingAgentTakeHome).toBe(7000);
    expect(result.buyerAgentTakeHome).toBe(7000);
  });

  // ─── Test 21: Fractional commission rate (4.75%) ───
  it('handles fractional commission rates accurately', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 4.75,
      listingAgentSplit: 50,
      brokerageSplit: 70,
    });
    // Total: 400K × 4.75% = 19,000
    expect(result.totalCommission).toBe(19000);
    expect(result.listingAgentCommission).toBe(9500);
    expect(result.buyerAgentCommission).toBe(9500);
  });

  // ─── Test 22: Agent split 70/30 ───
  it('handles 70/30 listing/buyer split', () => {
    const result = calculateRealEstateCommission({
      salePrice: 400000,
      totalCommissionRate: 5,
      listingAgentSplit: 70,
      brokerageSplit: 70,
    });
    // Total: 20K, Listing: 14K, Buyer: 6K
    expect(result.listingAgentCommission).toBe(14000);
    expect(result.buyerAgentCommission).toBe(6000);
    expect(result.listingAgentTakeHome).toBe(9800); // 14K × 70%
    expect(result.buyerAgentTakeHome).toBe(4200); // 6K × 70%
  });
});
