import { calculateHomeInsurance } from '@/lib/formulas/finance/home-insurance';

describe('calculateHomeInsurance', () => {
  // ─── Test 1: Standard $300k home, "other" state, all defaults ───
  it('calculates standard premium for $300k home in "other" state', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: 300000/1000 × 3.50 = $1,050
    // All multipliers = 1.0
    // Annual = $1,050
    expect(result.annualPremium).toBe(1050);
    expect(result.monthlyPremium).toBe(87.5);
  });

  // ─── Test 2: Texas (high rate state) ───
  it('calculates higher premium for Texas', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'TX',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: 300 × 5.50 = $1,650
    expect(result.annualPremium).toBe(1650);
    expect(result.baseRate).toBe(5.5);
  });

  // ─── Test 3: Florida (highest rate state) ───
  it('calculates highest premium for Florida', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'FL',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: 300 × 8.00 = $2,400
    expect(result.annualPremium).toBe(2400);
    expect(result.baseRate).toBe(8.0);
  });

  // ─── Test 4: Minnesota (low rate state) ───
  it('calculates lower premium for Minnesota', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'MN',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: 300 × 3.50 = $1,050
    expect(result.annualPremium).toBe(1050);
    expect(result.baseRate).toBe(3.5);
  });

  // ─── Test 5: High deductible ($5000) discount ───
  it('applies $5,000 deductible discount', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '5000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: $1,050 × 0.72 = $756
    expect(result.annualPremium).toBe(756);
  });

  // ─── Test 6: Low deductible ($500) surcharge ───
  it('applies $500 deductible surcharge', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '500',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: $1,050 × 1.15 = $1,207.50
    expect(result.annualPremium).toBe(1207.5);
  });

  // ─── Test 7: Premium coverage (HO-5) ───
  it('applies premium coverage multiplier', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'premium',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: $1,050 × 1.30 = $1,365
    expect(result.annualPremium).toBe(1365);
  });

  // ─── Test 8: Basic coverage (HO-1) ───
  it('applies basic coverage discount', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'basic',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: $1,050 × 0.80 = $840
    expect(result.annualPremium).toBe(840);
  });

  // ─── Test 9: Claims history impact (1 claim) ───
  it('applies claims history surcharge for 1 claim', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '1',
      creditScore: 'good',
    });
    // Base: $1,050 × 1.20 = $1,260
    expect(result.annualPremium).toBe(1260);
  });

  // ─── Test 10: Poor credit surcharge ───
  it('applies poor credit surcharge', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'poor',
    });
    // Base: $1,050 × 1.35 = $1,417.50
    expect(result.annualPremium).toBe(1417.5);
  });

  // ─── Test 11: Excellent credit discount ───
  it('applies excellent credit discount', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'excellent',
    });
    // Base: $1,050 × 0.85 = $892.50
    expect(result.annualPremium).toBe(892.5);
  });

  // ─── Test 12: Zero home value ───
  it('returns zero premium for zero home value', () => {
    const result = calculateHomeInsurance({
      homeValue: 0,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    expect(result.annualPremium).toBe(0);
    expect(result.monthlyPremium).toBe(0);
    expect(result.dailyPremium).toBe(0);
    expect(result.personalProperty).toBe(0);
  });

  // ─── Test 13: Million-dollar home ───
  it('calculates premium for $1M home', () => {
    const result = calculateHomeInsurance({
      homeValue: 1000000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: 1000 × 3.50 = $3,500
    expect(result.annualPremium).toBe(3500);
    expect(result.dwellingCoverage).toBe(1000000);
    expect(result.personalProperty).toBe(500000);
  });

  // ─── Test 14: Monthly premium accuracy ───
  it('calculates monthly premium correctly', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'FL',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Annual: $2,400 / 12 = $200
    expect(result.monthlyPremium).toBe(200);
  });

  // ─── Test 15: Daily premium accuracy ───
  it('calculates daily premium correctly', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Daily: $1,050 / 365 = $2.88
    expect(result.dailyPremium).toBe(2.88);
  });

  // ─── Test 16: Personal property estimate ───
  it('estimates personal property at 50% of dwelling', () => {
    const result = calculateHomeInsurance({
      homeValue: 400000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    expect(result.personalProperty).toBe(200000);
    expect(result.liabilityCoverage).toBe(100000);
  });

  // ─── Test 17: All multipliers combined — worst case ───
  it('calculates worst case: FL + $500 ded + premium + 2+ claims + poor credit', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'FL',
      deductible: '500',
      coverageType: 'premium',
      claimsHistory: '2+',
      creditScore: 'poor',
    });
    // Base: 300 × 8.00 = $2,400
    // × 1.15 × 1.30 × 1.45 × 1.35
    // = 2,400 × 1.15 = 2,760
    // × 1.30 = 3,588
    // × 1.45 = 5,202.60
    // × 1.35 = 7,023.51
    expect(result.annualPremium).toBe(7023.51);
  });

  // ─── Test 18: All multipliers combined — best case ───
  it('calculates best case: MN + $5000 ded + basic + 0 claims + excellent credit', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'MN',
      deductible: '5000',
      coverageType: 'basic',
      claimsHistory: '0',
      creditScore: 'excellent',
    });
    // Base: 300 × 3.50 = $1,050
    // × 0.72 × 0.80 × 1.00 × 0.85
    // = 1,050 × 0.72 = 756
    // × 0.80 = 604.80
    // × 1.00 = 604.80
    // × 0.85 = 514.08
    expect(result.annualPremium).toBe(514.08);
  });

  // ─── Test 19: Cost breakdown structure ───
  it('returns correct cost breakdown structure', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(6);
    expect(breakdown[0].label).toBe('Base Premium');
    expect(breakdown[0].value).toBe(1050);
    expect(breakdown[5].label).toBe('Annual Premium');
    expect(breakdown[5].value).toBe(1050);
  });

  // ─── Test 20: Coverage summary structure ───
  it('returns correct coverage summary structure', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    const summary = result.coverageSummary as { label: string; value: number }[];
    expect(summary).toHaveLength(4);
    expect(summary[0]).toEqual({ label: 'Dwelling Coverage', value: 300000 });
    expect(summary[1]).toEqual({ label: 'Personal Property', value: 150000 });
    expect(summary[2]).toEqual({ label: 'Liability Coverage', value: 100000 });
    expect(summary[3]).toEqual({ label: 'Medical Payments', value: 5000 });
  });

  // ─── Test 21: Output structure validation ───
  it('returns all expected output fields', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    expect(result).toHaveProperty('annualPremium');
    expect(result).toHaveProperty('monthlyPremium');
    expect(result).toHaveProperty('dailyPremium');
    expect(result).toHaveProperty('dwellingCoverage');
    expect(result).toHaveProperty('personalProperty');
    expect(result).toHaveProperty('liabilityCoverage');
    expect(result).toHaveProperty('medicalPayments');
    expect(result).toHaveProperty('baseRate');
    expect(result).toHaveProperty('costBreakdown');
    expect(result).toHaveProperty('coverageSummary');
    expect(Array.isArray(result.costBreakdown)).toBe(true);
    expect(Array.isArray(result.coverageSummary)).toBe(true);
  });

  // ─── Test 22: $2,000 deductible discount ───
  it('applies $2,000 deductible discount correctly', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '2000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'good',
    });
    // Base: $1,050 × 0.87 = $913.50
    expect(result.annualPremium).toBe(913.5);
  });

  // ─── Test 23: 2+ claims history ───
  it('applies 2+ claims history surcharge', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '2+',
      creditScore: 'good',
    });
    // Base: $1,050 × 1.45 = $1,522.50
    expect(result.annualPremium).toBe(1522.5);
  });

  // ─── Test 24: Fair credit tier ───
  it('applies fair credit multiplier', () => {
    const result = calculateHomeInsurance({
      homeValue: 300000,
      state: 'other',
      deductible: '1000',
      coverageType: 'standard',
      claimsHistory: '0',
      creditScore: 'fair',
    });
    // Base: $1,050 × 1.15 = $1,207.50
    expect(result.annualPremium).toBe(1207.5);
  });
});
