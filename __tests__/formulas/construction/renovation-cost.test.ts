import { calculateRenovationCost } from '@/lib/formulas/construction/renovation-cost';

describe('calculateRenovationCost', () => {
  const defaults = {
    squareFootage: 2000,
    qualityLevel: 'mid-range',
    includeKitchen: 'yes',
    includeBathrooms: 2,
    structuralChanges: 'no',
    contingencyPercent: 15,
    permitPercent: 1.5,
  };

  // ─── Test 1: Standard 2,000 sq ft mid-range renovation ───
  it('calculates a standard 2,000 sq ft mid-range renovation', () => {
    const result = calculateRenovationCost(defaults);
    // Base: 2000 × 112.50 = 225,000
    // Kitchen: 35,000
    // Bathrooms: 2 × 20,000 = 40,000
    // Structural: 0
    // Subtotal: 300,000
    // Permits: 300,000 × 0.015 = 4,500
    // Contingency: 300,000 × 0.15 = 45,000
    // Total: 349,500
    expect(result.totalCost).toBe(349500);
    expect(result.baseCost).toBe(225000);
    expect(result.kitchenCost).toBe(35000);
    expect(result.bathroomCost).toBe(40000);
    expect(result.structuralCost).toBe(0);
    expect(result.permitCost).toBe(4500);
    expect(result.contingency).toBe(45000);
  });

  // ─── Test 2: Basic quality level ───
  it('calculates basic quality at $62.50/sqft', () => {
    const result = calculateRenovationCost({ ...defaults, qualityLevel: 'basic' });
    // Base: 2000 × 62.50 = 125,000
    expect(result.baseCost).toBe(125000);
    expect(Number(result.baseCost)).toBeLessThan(Number(
      calculateRenovationCost({ ...defaults, qualityLevel: 'mid-range' }).baseCost
    ));
  });

  // ─── Test 3: Mid-range quality level ───
  it('calculates mid-range quality at $112.50/sqft', () => {
    const result = calculateRenovationCost({ ...defaults, qualityLevel: 'mid-range' });
    expect(result.baseCost).toBe(225000);
  });

  // ─── Test 4: High-end quality level ───
  it('calculates high-end quality at $225/sqft', () => {
    const result = calculateRenovationCost({ ...defaults, qualityLevel: 'high-end' });
    expect(result.baseCost).toBe(450000);
  });

  // ─── Test 5: Luxury quality level ───
  it('calculates luxury quality at $400/sqft', () => {
    const result = calculateRenovationCost({ ...defaults, qualityLevel: 'luxury' });
    expect(result.baseCost).toBe(800000);
  });

  // ─── Test 6: Without kitchen ───
  it('returns $0 kitchen cost when kitchen not included', () => {
    const result = calculateRenovationCost({ ...defaults, includeKitchen: 'no' });
    expect(result.kitchenCost).toBe(0);
    const withKitchen = calculateRenovationCost({ ...defaults, includeKitchen: 'yes' });
    expect(Number(result.totalCost)).toBeLessThan(Number(withKitchen.totalCost));
  });

  // ─── Test 7: With kitchen at different quality levels ───
  it('scales kitchen premium by quality level', () => {
    const basic = calculateRenovationCost({ ...defaults, qualityLevel: 'basic', includeKitchen: 'yes' });
    const luxury = calculateRenovationCost({ ...defaults, qualityLevel: 'luxury', includeKitchen: 'yes' });
    expect(basic.kitchenCost).toBe(15000);
    expect(luxury.kitchenCost).toBe(80000);
  });

  // ─── Test 8: Zero bathrooms ───
  it('returns $0 bathroom cost with 0 bathrooms', () => {
    const result = calculateRenovationCost({ ...defaults, includeBathrooms: 0 });
    expect(result.bathroomCost).toBe(0);
  });

  // ─── Test 9: 1 bathroom ───
  it('calculates 1 bathroom at mid-range ($20,000)', () => {
    const result = calculateRenovationCost({ ...defaults, includeBathrooms: 1 });
    expect(result.bathroomCost).toBe(20000);
  });

  // ─── Test 10: 3 bathrooms ───
  it('calculates 3 bathrooms at mid-range ($60,000)', () => {
    const result = calculateRenovationCost({ ...defaults, includeBathrooms: 3 });
    expect(result.bathroomCost).toBe(60000);
  });

  // ─── Test 11: 5 bathrooms (max) ───
  it('calculates 5 bathrooms at mid-range ($100,000)', () => {
    const result = calculateRenovationCost({ ...defaults, includeBathrooms: 5 });
    expect(result.bathroomCost).toBe(100000);
  });

  // ─── Test 12: Bathrooms capped at 5 ───
  it('caps bathrooms at 5', () => {
    const result = calculateRenovationCost({ ...defaults, includeBathrooms: 8 });
    expect(result.bathroomCost).toBe(100000); // 5 × 20,000
  });

  // ─── Test 13: Structural changes adds 20% of base ───
  it('adds 20% structural surcharge on base cost', () => {
    const result = calculateRenovationCost({ ...defaults, structuralChanges: 'yes' });
    // Structural: 225,000 × 0.20 = 45,000
    expect(result.structuralCost).toBe(45000);
    const noStructural = calculateRenovationCost({ ...defaults, structuralChanges: 'no' });
    expect(noStructural.structuralCost).toBe(0);
  });

  // ─── Test 14: Custom contingency percent ───
  it('applies custom contingency percentage', () => {
    const result10 = calculateRenovationCost({ ...defaults, contingencyPercent: 10 });
    const result20 = calculateRenovationCost({ ...defaults, contingencyPercent: 20 });
    // Subtotal: 300,000
    expect(result10.contingency).toBe(30000);  // 300,000 × 0.10
    expect(result20.contingency).toBe(60000);  // 300,000 × 0.20
  });

  // ─── Test 15: Custom permit percent ───
  it('applies custom permit percentage', () => {
    const result1 = calculateRenovationCost({ ...defaults, permitPercent: 1 });
    const result2 = calculateRenovationCost({ ...defaults, permitPercent: 2 });
    // Subtotal: 300,000
    expect(result1.permitCost).toBe(3000);   // 300,000 × 0.01
    expect(result2.permitCost).toBe(6000);   // 300,000 × 0.02
  });

  // ─── Test 16: Zero contingency and zero permits ───
  it('handles 0% contingency and 0% permits', () => {
    const result = calculateRenovationCost({
      ...defaults,
      contingencyPercent: 0,
      permitPercent: 0,
    });
    expect(result.contingency).toBe(0);
    expect(result.permitCost).toBe(0);
    // Total should equal subtotal
    expect(result.totalCost).toBe(300000);
  });

  // ─── Test 17: Zero square footage returns all zeros ───
  it('returns all zeros for zero square footage', () => {
    const result = calculateRenovationCost({ ...defaults, squareFootage: 0 });
    expect(result.totalCost).toBe(0);
    expect(result.baseCost).toBe(0);
    expect(result.kitchenCost).toBe(0);
    expect(result.bathroomCost).toBe(0);
    expect(result.structuralCost).toBe(0);
    expect(result.permitCost).toBe(0);
    expect(result.contingency).toBe(0);
    expect(result.effectiveCostPerSqFt).toBe(0);
  });

  // ─── Test 18: Negative square footage treated as zero ───
  it('treats negative square footage as zero', () => {
    const result = calculateRenovationCost({ ...defaults, squareFootage: -500 });
    expect(result.totalCost).toBe(0);
    expect(result.baseCost).toBe(0);
  });

  // ─── Test 19: Large home (5,000 sq ft) ───
  it('handles a large 5,000 sq ft home', () => {
    const result = calculateRenovationCost({ ...defaults, squareFootage: 5000 });
    // Base: 5000 × 112.50 = 562,500
    expect(result.baseCost).toBe(562500);
    expect(Number(result.totalCost)).toBeGreaterThan(700000);
  });

  // ─── Test 20: Effective cost per sq ft ───
  it('calculates effective cost per sq ft correctly', () => {
    const result = calculateRenovationCost(defaults);
    const expected = parseFloat((Number(result.totalCost) / 2000).toFixed(2));
    expect(result.effectiveCostPerSqFt).toBe(expected);
  });

  // ─── Test 21: All minimum options (lowest possible) ───
  it('calculates lowest cost with all minimum options', () => {
    const result = calculateRenovationCost({
      squareFootage: 500,
      qualityLevel: 'basic',
      includeKitchen: 'no',
      includeBathrooms: 0,
      structuralChanges: 'no',
      contingencyPercent: 0,
      permitPercent: 0,
    });
    // Base: 500 × 62.50 = 31,250
    expect(result.totalCost).toBe(31250);
    expect(result.baseCost).toBe(31250);
    expect(result.kitchenCost).toBe(0);
    expect(result.bathroomCost).toBe(0);
    expect(result.structuralCost).toBe(0);
    expect(result.permitCost).toBe(0);
    expect(result.contingency).toBe(0);
  });

  // ─── Test 22: All maximum options (highest possible) ───
  it('calculates highest cost with all maximum options', () => {
    const result = calculateRenovationCost({
      squareFootage: 5000,
      qualityLevel: 'luxury',
      includeKitchen: 'yes',
      includeBathrooms: 5,
      structuralChanges: 'yes',
      contingencyPercent: 20,
      permitPercent: 3,
    });
    // Base: 5000 × 400 = 2,000,000
    // Kitchen: 80,000
    // Bathrooms: 5 × 50,000 = 250,000
    // Structural: 2,000,000 × 0.20 = 400,000
    // Subtotal: 2,730,000
    // Permits: 2,730,000 × 0.03 = 81,900
    // Contingency: 2,730,000 × 0.20 = 546,000
    // Total: 3,357,900
    expect(result.baseCost).toBe(2000000);
    expect(result.kitchenCost).toBe(80000);
    expect(result.bathroomCost).toBe(250000);
    expect(result.structuralCost).toBe(400000);
    expect(result.permitCost).toBe(81900);
    expect(result.contingency).toBe(546000);
    expect(result.totalCost).toBe(3357900);
  });

  // ─── Test 23: Cost breakdown structure ───
  it('returns cost breakdown with 6 items and correct labels', () => {
    const result = calculateRenovationCost(defaults);
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(6);
    expect(breakdown[0].label).toBe('Base Renovation');
    expect(breakdown[1].label).toBe('Kitchen Renovation');
    expect(breakdown[2].label).toBe('Bathroom Renovation(s)');
    expect(breakdown[3].label).toBe('Structural Changes');
    expect(breakdown[4].label).toBe('Estimated Permits');
    expect(breakdown[5].label).toBe('Contingency Buffer');
  });

  // ─── Test 24: Cost breakdown values match individual outputs ───
  it('cost breakdown values match individual output fields', () => {
    const result = calculateRenovationCost(defaults);
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown[0].value).toBe(result.baseCost);
    expect(breakdown[1].value).toBe(result.kitchenCost);
    expect(breakdown[2].value).toBe(result.bathroomCost);
    expect(breakdown[3].value).toBe(result.structuralCost);
    expect(breakdown[4].value).toBe(result.permitCost);
    expect(breakdown[5].value).toBe(result.contingency);
  });

  // ─── Test 25: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateRenovationCost(defaults);
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('baseCost');
    expect(result).toHaveProperty('kitchenCost');
    expect(result).toHaveProperty('bathroomCost');
    expect(result).toHaveProperty('structuralCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('contingency');
    expect(result).toHaveProperty('effectiveCostPerSqFt');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 26: Small home (500 sq ft) ───
  it('handles a small 500 sq ft home', () => {
    const result = calculateRenovationCost({ ...defaults, squareFootage: 500 });
    // Base: 500 × 112.50 = 56,250
    expect(result.baseCost).toBe(56250);
    expect(Number(result.totalCost)).toBeLessThan(Number(
      calculateRenovationCost(defaults).totalCost
    ));
  });

  // ─── Test 27: Structural changes with different quality levels ───
  it('structural surcharge scales with quality level', () => {
    const basic = calculateRenovationCost({
      ...defaults,
      qualityLevel: 'basic',
      structuralChanges: 'yes',
    });
    const luxury = calculateRenovationCost({
      ...defaults,
      qualityLevel: 'luxury',
      structuralChanges: 'yes',
    });
    // Basic structural: 125,000 × 0.20 = 25,000
    // Luxury structural: 800,000 × 0.20 = 160,000
    expect(basic.structuralCost).toBe(25000);
    expect(luxury.structuralCost).toBe(160000);
  });

  // ─── Test 28: Unknown quality level defaults to mid-range ───
  it('falls back to mid-range for unknown quality level', () => {
    const result = calculateRenovationCost({ ...defaults, qualityLevel: 'ultra-mega' });
    // Should use mid-range fallback ($112.50/sqft)
    expect(result.baseCost).toBe(225000);
  });
});
