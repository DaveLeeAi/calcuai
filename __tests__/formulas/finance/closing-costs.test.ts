import { calculateClosingCosts } from '@/lib/formulas/finance/closing-costs';

describe('calculateClosingCosts', () => {
  // ─── Test 1: Standard buyer — $300K, 20% down, conventional ───
  it('calculates buyer closing costs for $300K home, 20% down, conventional loan', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    expect(result.loanAmount).toBe(240000);
    expect(result.originationFee).toBe(2400); // 1% of loan
    expect(result.appraisalFee).toBe(400);
    expect(result.creditReportFee).toBe(50);
    expect(result.titleInsurance).toBe(1500); // 0.5% of home price
    expect(result.pmiFirstYear).toBe(0); // 20% down, no PMI
    expect(result.fhaUpfrontMIP).toBe(0);
    expect(result.vaFundingFee).toBe(0);
    expect(result.surveyFee).toBe(0);
    const total = result.totalClosingCosts as number;
    expect(total).toBeGreaterThan(5000);
    expect(total).toBeLessThan(15000);
  });

  // ─── Test 2: FHA loan — triggers 1.75% upfront MIP ───
  it('adds FHA upfront MIP on FHA loans', () => {
    const result = calculateClosingCosts({
      homePrice: 250000,
      downPaymentPercent: 3.5,
      loanType: 'fha',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    const loanAmount = result.loanAmount as number;
    expect(loanAmount).toBeCloseTo(250000 * 0.965, 0);
    expect(result.fhaUpfrontMIP).toBeCloseTo(loanAmount * 0.0175, 0);
    expect(result.vaFundingFee).toBe(0);
    // FHA with 3.5% down should also have PMI
    expect(result.pmiFirstYear).toBeGreaterThan(0);
  });

  // ─── Test 3: VA loan — triggers 2.3% funding fee ───
  it('adds VA funding fee on VA loans', () => {
    const result = calculateClosingCosts({
      homePrice: 350000,
      downPaymentPercent: 0,
      loanType: 'va',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    const loanAmount = result.loanAmount as number;
    expect(loanAmount).toBe(350000);
    expect(result.vaFundingFee).toBeCloseTo(350000 * 0.023, 0);
    expect(result.fhaUpfrontMIP).toBe(0);
  });

  // ─── Test 4: Buyer with < 20% down — PMI included ───
  it('includes PMI when down payment is less than 20%', () => {
    const result = calculateClosingCosts({
      homePrice: 400000,
      downPaymentPercent: 10,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    const loanAmount = result.loanAmount as number;
    expect(loanAmount).toBe(360000);
    expect(result.pmiFirstYear).toBeCloseTo(360000 * 0.005, 0); // 0.5% of loan
  });

  // ─── Test 5: Seller costs ───
  it('calculates seller closing costs', () => {
    const result = calculateClosingCosts({
      homePrice: 400000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'seller',
    });
    expect(result.agentCommission).toBe(20000); // 5%
    expect(result.transferTax).toBe(800); // 0.2%
    expect(result.titleInsurance).toBe(2000); // 0.5%
    expect(result.attorneyFee).toBe(750);
    expect(result.recordingFee).toBe(125);
    const proRated = result.proRatedTax as number;
    expect(proRated).toBeCloseTo((400000 * 0.012) / 12 * 6, 0);
    const total = result.totalSellerCosts as number;
    expect(total).toBeCloseTo(20000 + 800 + 2000 + 750 + 125 + proRated, 0);
  });

  // ─── Test 6: New construction — survey fee included ───
  it('includes survey fee for new construction', () => {
    const result = calculateClosingCosts({
      homePrice: 500000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: true,
      buyerOrSeller: 'buyer',
    });
    expect(result.surveyFee).toBe(500);
  });

  // ─── Test 7: No survey fee for existing home ───
  it('does not include survey fee for existing home', () => {
    const result = calculateClosingCosts({
      homePrice: 500000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    expect(result.surveyFee).toBe(0);
  });

  // ─── Test 8: Zero home price — all zeros ───
  it('returns all zeros when home price is zero', () => {
    const result = calculateClosingCosts({
      homePrice: 0,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    expect(result.totalClosingCosts).toBe(0);
    expect(result.loanAmount).toBe(0);
    expect(result.totalCashNeeded).toBe(0);
  });

  // ─── Test 9: Zero home price — seller ───
  it('returns all zeros for seller when home price is zero', () => {
    const result = calculateClosingCosts({
      homePrice: 0,
      buyerOrSeller: 'seller',
    });
    expect(result.totalSellerCosts).toBe(0);
    expect(result.netProceeds).toBe(0);
  });

  // ─── Test 10: 100% down payment — no loan-dependent fees ───
  it('handles 100% down payment with zero loan amount', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      downPaymentPercent: 100,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    expect(result.loanAmount).toBe(0);
    expect(result.originationFee).toBe(0);
    expect(result.prepaidInterest).toBe(0);
    expect(result.pmiFirstYear).toBe(0);
    // Still has home-price-based fees like title insurance
    expect(result.titleInsurance).toBe(1500);
    expect(result.homeInspection).toBe(350);
  });

  // ─── Test 11: Low price ($100K) ───
  it('calculates correctly for $100K home', () => {
    const result = calculateClosingCosts({
      homePrice: 100000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    expect(result.loanAmount).toBe(80000);
    expect(result.originationFee).toBe(800);
    expect(result.titleInsurance).toBe(500);
    const total = result.totalClosingCosts as number;
    expect(total).toBeGreaterThan(2000);
    expect(total).toBeLessThan(8000);
  });

  // ─── Test 12: High price ($1M) ───
  it('calculates correctly for $1M home', () => {
    const result = calculateClosingCosts({
      homePrice: 1000000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    expect(result.loanAmount).toBe(800000);
    expect(result.originationFee).toBe(8000);
    expect(result.titleInsurance).toBe(5000);
    const total = result.totalClosingCosts as number;
    expect(total).toBeGreaterThan(15000);
  });

  // ─── Test 13: Total cash needed = down payment + closing costs ───
  it('total cash needed equals down payment plus closing costs', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    const downPaymentAmount = 300000 * 0.20;
    const totalCash = result.totalCashNeeded as number;
    const closingCosts = result.totalClosingCosts as number;
    expect(totalCash).toBeCloseTo(downPaymentAmount + closingCosts, 0);
  });

  // ─── Test 14: Closing cost percentage ───
  it('closing cost percentage is within typical range (2-5%) for standard buyer', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    const pct = result.closingCostPercent as number;
    expect(pct).toBeGreaterThan(1.5);
    expect(pct).toBeLessThan(6);
  });

  // ─── Test 15: Cost breakdown structure — buyer ───
  it('returns cost breakdown with correct structure for buyer', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      downPaymentPercent: 10,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown.length).toBeGreaterThanOrEqual(10);
    const labels = breakdown.map(b => b.label);
    expect(labels).toContain('Loan Origination Fee (1%)');
    expect(labels).toContain('Appraisal Fee');
    expect(labels).toContain('Title Insurance');
    expect(labels).toContain('PMI (1st year)'); // 10% down triggers PMI
    // All values should be numbers
    breakdown.forEach(item => {
      expect(typeof item.value).toBe('number');
      expect(item.value).toBeGreaterThanOrEqual(0);
    });
  });

  // ─── Test 16: Cost breakdown structure — seller ───
  it('returns cost breakdown with correct structure for seller', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      buyerOrSeller: 'seller',
    });
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(6);
    const labels = breakdown.map(b => b.label);
    expect(labels).toContain('Agent Commission (5%)');
    expect(labels).toContain('Transfer Tax');
    expect(labels).toContain('Title Insurance');
  });

  // ─── Test 17: Seller net proceeds ───
  it('seller net proceeds equals home price minus seller costs', () => {
    const result = calculateClosingCosts({
      homePrice: 500000,
      buyerOrSeller: 'seller',
    });
    const total = result.totalSellerCosts as number;
    const net = result.netProceeds as number;
    expect(net).toBeCloseTo(500000 - total, 0);
  });

  // ─── Test 18: Individual fee accuracy — prepaid interest ───
  it('calculates prepaid interest correctly (15 days at 7%)', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    // 240000 * 0.07 / 365 * 15 = $690.41
    const prepaid = result.prepaidInterest as number;
    expect(prepaid).toBeCloseTo((240000 * 0.07 / 365) * 15, 0);
  });

  // ─── Test 19: Property tax escrow (3 months) ───
  it('calculates property tax escrow for 3 months correctly', () => {
    const result = calculateClosingCosts({
      homePrice: 400000,
      downPaymentPercent: 20,
      loanType: 'conventional',
      isNewConstruction: false,
      buyerOrSeller: 'buyer',
    });
    // 400000 * 0.012 / 12 * 3 = $1,200
    expect(result.propertyTaxEscrow).toBeCloseTo((400000 * 0.012) / 12 * 3, 0);
  });

  // ─── Test 20: Seller cost percentage ───
  it('calculates seller cost percentage correctly', () => {
    const result = calculateClosingCosts({
      homePrice: 300000,
      buyerOrSeller: 'seller',
    });
    const pct = result.sellerCostPercent as number;
    // Seller costs dominated by 5% commission → expect ~6-8%
    expect(pct).toBeGreaterThan(5);
    expect(pct).toBeLessThan(10);
  });
});
