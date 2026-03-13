import { calculateKitchenRemodel } from '@/lib/formulas/construction/kitchen-remodel';

describe('calculateKitchenRemodel', () => {
  const defaults = {
    kitchenSize: 150,
    cabinetQuality: 'semi-custom',
    countertopMaterial: 'granite',
    appliancePackage: 'mid',
    flooringType: 'tile',
    backsplashIncluded: 'yes',
    layoutChange: 'minor',
  };

  // ─── Test 1: Standard 150 sq ft kitchen with defaults ───
  it('calculates a standard 150 sq ft kitchen with defaults', () => {
    const result = calculateKitchenRemodel(defaults);
    expect(result.totalCost).toBeGreaterThan(20000);
    expect(result.totalCost).toBeLessThan(60000);
    expect(result.costPerSqFt).toBeGreaterThan(100);
  });

  // ─── Test 2: Small kitchen (80 sq ft) ───
  it('handles a small 80 sq ft kitchen', () => {
    const result = calculateKitchenRemodel({ ...defaults, kitchenSize: 80 });
    expect(result.totalCost).toBeGreaterThan(10000);
    expect(result.totalCost).toBeLessThan(40000);
    // Smaller kitchen should cost less total than default
    const defaultResult = calculateKitchenRemodel(defaults);
    expect(Number(result.totalCost)).toBeLessThan(Number(defaultResult.totalCost));
  });

  // ─── Test 3: Large kitchen (300 sq ft) ───
  it('handles a large 300 sq ft kitchen', () => {
    const result = calculateKitchenRemodel({ ...defaults, kitchenSize: 300 });
    const defaultResult = calculateKitchenRemodel(defaults);
    expect(Number(result.totalCost)).toBeGreaterThan(Number(defaultResult.totalCost));
  });

  // ─── Test 4: Stock cabinets ───
  it('calculates lower cost for stock cabinets', () => {
    const stock = calculateKitchenRemodel({ ...defaults, cabinetQuality: 'stock' });
    const semiCustom = calculateKitchenRemodel({ ...defaults, cabinetQuality: 'semi-custom' });
    expect(Number(stock.cabinetCost)).toBeLessThan(Number(semiCustom.cabinetCost));
  });

  // ─── Test 5: Custom cabinets ───
  it('calculates higher cost for custom cabinets', () => {
    const custom = calculateKitchenRemodel({ ...defaults, cabinetQuality: 'custom' });
    const semiCustom = calculateKitchenRemodel({ ...defaults, cabinetQuality: 'semi-custom' });
    expect(Number(custom.cabinetCost)).toBeGreaterThan(Number(semiCustom.cabinetCost));
  });

  // ─── Test 6: Laminate countertops ───
  it('calculates lower cost for laminate countertops', () => {
    const laminate = calculateKitchenRemodel({ ...defaults, countertopMaterial: 'laminate' });
    const granite = calculateKitchenRemodel({ ...defaults, countertopMaterial: 'granite' });
    expect(Number(laminate.countertopCost)).toBeLessThan(Number(granite.countertopCost));
  });

  // ─── Test 7: Marble countertops ───
  it('calculates higher cost for marble countertops', () => {
    const marble = calculateKitchenRemodel({ ...defaults, countertopMaterial: 'marble' });
    const granite = calculateKitchenRemodel({ ...defaults, countertopMaterial: 'granite' });
    expect(Number(marble.countertopCost)).toBeGreaterThan(Number(granite.countertopCost));
  });

  // ─── Test 8: Basic appliances ───
  it('calculates $3,000 for basic appliance package', () => {
    const result = calculateKitchenRemodel({ ...defaults, appliancePackage: 'basic' });
    expect(result.applianceCost).toBe(3000);
  });

  // ─── Test 9: Premium appliances ───
  it('calculates $11,500 for premium appliance package', () => {
    const result = calculateKitchenRemodel({ ...defaults, appliancePackage: 'premium' });
    expect(result.applianceCost).toBe(11500);
  });

  // ─── Test 10: Vinyl flooring ───
  it('calculates lower cost for vinyl flooring', () => {
    const vinyl = calculateKitchenRemodel({ ...defaults, flooringType: 'vinyl' });
    const tile = calculateKitchenRemodel({ ...defaults, flooringType: 'tile' });
    expect(Number(vinyl.flooringCost)).toBeLessThan(Number(tile.flooringCost));
  });

  // ─── Test 11: Hardwood flooring ───
  it('calculates higher cost for hardwood flooring', () => {
    const hardwood = calculateKitchenRemodel({ ...defaults, flooringType: 'hardwood' });
    const tile = calculateKitchenRemodel({ ...defaults, flooringType: 'tile' });
    expect(Number(hardwood.flooringCost)).toBeGreaterThan(Number(tile.flooringCost));
  });

  // ─── Test 12: No backsplash ───
  it('returns $0 backsplash cost when no backsplash selected', () => {
    const result = calculateKitchenRemodel({ ...defaults, backsplashIncluded: 'no' });
    expect(result.backsplashCost).toBe(0);
  });

  // ─── Test 13: Premium backsplash ───
  it('calculates higher cost for premium backsplash', () => {
    const premium = calculateKitchenRemodel({ ...defaults, backsplashIncluded: 'premium' });
    const basic = calculateKitchenRemodel({ ...defaults, backsplashIncluded: 'basic' });
    expect(Number(premium.backsplashCost)).toBeGreaterThan(Number(basic.backsplashCost));
  });

  // ─── Test 14: No layout change ───
  it('returns lower total when no layout change selected', () => {
    const noChange = calculateKitchenRemodel({ ...defaults, layoutChange: 'none' });
    const minor = calculateKitchenRemodel({ ...defaults, layoutChange: 'minor' });
    expect(Number(noChange.totalCost)).toBeLessThan(Number(minor.totalCost));
  });

  // ─── Test 15: Major layout change ───
  it('adds $8,000 for major layout change', () => {
    const major = calculateKitchenRemodel({ ...defaults, layoutChange: 'major' });
    const none = calculateKitchenRemodel({ ...defaults, layoutChange: 'none' });
    // Major layout adds $8000 to plumbing/electrical vs none
    expect(Number(major.plumbingElectrical) - Number(none.plumbingElectrical)).toBeCloseTo(8000, 0);
  });

  // ─── Test 16: Zero kitchen size returns zeros ───
  it('returns all zeros for zero kitchen size', () => {
    const result = calculateKitchenRemodel({ ...defaults, kitchenSize: 0 });
    expect(result.totalCost).toBe(0);
    expect(result.costPerSqFt).toBe(0);
    expect(result.cabinetCost).toBe(0);
    expect(result.countertopCost).toBe(0);
    expect(result.applianceCost).toBe(0);
    expect(result.flooringCost).toBe(0);
    expect(result.backsplashCost).toBe(0);
    expect(result.laborCost).toBe(0);
    expect(result.plumbingElectrical).toBe(0);
  });

  // ─── Test 17: All budget options (lowest possible) ───
  it('calculates lowest cost with all budget options', () => {
    const budget = calculateKitchenRemodel({
      kitchenSize: 100,
      cabinetQuality: 'stock',
      countertopMaterial: 'laminate',
      appliancePackage: 'basic',
      flooringType: 'vinyl',
      backsplashIncluded: 'no',
      layoutChange: 'none',
    });
    // Budget kitchen should be under $20,000
    expect(Number(budget.totalCost)).toBeLessThan(20000);
    expect(Number(budget.totalCost)).toBeGreaterThan(5000);
  });

  // ─── Test 18: All premium options (highest possible) ───
  it('calculates highest cost with all premium options', () => {
    const premium = calculateKitchenRemodel({
      kitchenSize: 300,
      cabinetQuality: 'custom',
      countertopMaterial: 'marble',
      appliancePackage: 'premium',
      flooringType: 'hardwood',
      backsplashIncluded: 'premium',
      layoutChange: 'major',
    });
    // Premium large kitchen should be very expensive
    expect(Number(premium.totalCost)).toBeGreaterThan(60000);
  });

  // ─── Test 19: Cost per sq ft is total / kitchen size ───
  it('cost per sq ft equals total divided by kitchen size', () => {
    const result = calculateKitchenRemodel(defaults);
    const expected = parseFloat((Number(result.totalCost) / 150).toFixed(2));
    expect(result.costPerSqFt).toBe(expected);
  });

  // ─── Test 20: Labor is 35% of materials ───
  it('labor cost is 35% of total materials cost', () => {
    const result = calculateKitchenRemodel(defaults);
    const materials =
      Number(result.cabinetCost) +
      Number(result.countertopCost) +
      Number(result.applianceCost) +
      Number(result.flooringCost) +
      Number(result.backsplashCost);
    const expectedLabor = parseFloat((materials * 0.35).toFixed(2));
    expect(result.laborCost).toBe(expectedLabor);
  });

  // ─── Test 21: Output structure has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateKitchenRemodel(defaults);
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('cabinetCost');
    expect(result).toHaveProperty('countertopCost');
    expect(result).toHaveProperty('applianceCost');
    expect(result).toHaveProperty('flooringCost');
    expect(result).toHaveProperty('backsplashCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('plumbingElectrical');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 22: Cost breakdown array has correct items ───
  it('cost breakdown has 8 items with correct labels', () => {
    const result = calculateKitchenRemodel(defaults);
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(8);
    expect(breakdown[0].label).toBe('Cabinets');
    expect(breakdown[1].label).toBe('Countertops');
    expect(breakdown[2].label).toBe('Appliances');
    expect(breakdown[3].label).toBe('Flooring');
    expect(breakdown[4].label).toBe('Backsplash');
    expect(breakdown[5].label).toBe('Layout Changes');
    expect(breakdown[6].label).toBe('Labor & Installation');
    expect(breakdown[7].label).toBe('Plumbing & Electrical');
  });

  // ─── Test 23: Cabinet cost uses correct per-LF rates ───
  it('cabinet cost matches expected per-linear-foot calculation', () => {
    const result = calculateKitchenRemodel({ ...defaults, kitchenSize: 100, cabinetQuality: 'stock' });
    // cabinetLF = sqrt(100) * 2.5 = 10 * 2.5 = 25 lf
    // stock = $200/lf → 25 * 200 = $5,000
    expect(result.cabinetCost).toBe(5000);
  });

  // ─── Test 24: Countertop area is 40% of floor area ───
  it('countertop cost uses 40% of floor area', () => {
    const result = calculateKitchenRemodel({ ...defaults, kitchenSize: 100, countertopMaterial: 'laminate' });
    // counterArea = 100 * 0.4 = 40 sq ft, laminate = $25/sf → 40 * 25 = $1,000
    expect(result.countertopCost).toBe(1000);
  });
});
