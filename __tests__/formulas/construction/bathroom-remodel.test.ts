import { calculateBathroomRemodel } from '@/lib/formulas/construction/bathroom-remodel';

describe('calculateBathroomRemodel', () => {
  const defaults = {
    bathroomSize: 75,
    bathroomType: 'full',
    vanityType: 'mid',
    showerTub: 'replace',
    tileArea: 100,
    tileQuality: 'mid',
    fixtureLevel: 'mid',
    plumbingChanges: 'minor',
  };

  // ─── Test 1: Standard 75 sq ft full bath with defaults ───
  it('calculates a standard 75 sq ft full bath with defaults', () => {
    const result = calculateBathroomRemodel(defaults);
    expect(result.totalCost).toBeGreaterThan(5000);
    expect(result.totalCost).toBeLessThan(25000);
    expect(result.costPerSqFt).toBeGreaterThan(50);
  });

  // ─── Test 2: Half bath (toilet + sink only, no shower) ───
  it('forces shower/tub to none for half bath', () => {
    const result = calculateBathroomRemodel({
      ...defaults,
      bathroomType: 'half',
      showerTub: 'replace',  // should be ignored
    });
    expect(result.showerTubCost).toBe(0);
  });

  // ─── Test 3: Master bath (double vanity, premium) ───
  it('doubles vanity cost for master bath', () => {
    const master = calculateBathroomRemodel({ ...defaults, bathroomType: 'master' });
    const full = calculateBathroomRemodel({ ...defaults, bathroomType: 'full' });
    expect(Number(master.vanityCost)).toBe(Number(full.vanityCost) * 2);
  });

  // ─── Test 4: Small bathroom (35 sq ft) ───
  it('handles a small 35 sq ft bathroom', () => {
    const result = calculateBathroomRemodel({ ...defaults, bathroomSize: 35 });
    expect(result.totalCost).toBeGreaterThan(3000);
    const defaultResult = calculateBathroomRemodel(defaults);
    // Cost per sq ft higher for small bath (fixed costs spread over less area)
    expect(Number(result.costPerSqFt)).toBeGreaterThan(Number(defaultResult.costPerSqFt));
  });

  // ─── Test 5: Large master bath (150 sq ft) ───
  it('handles a large 150 sq ft master bath', () => {
    const result = calculateBathroomRemodel({
      ...defaults,
      bathroomSize: 150,
      bathroomType: 'master',
    });
    const defaultResult = calculateBathroomRemodel(defaults);
    expect(Number(result.totalCost)).toBeGreaterThan(Number(defaultResult.totalCost));
  });

  // ─── Test 6: Stock vanity vs custom vanity ───
  it('stock vanity costs less than custom', () => {
    const stock = calculateBathroomRemodel({ ...defaults, vanityType: 'stock' });
    const custom = calculateBathroomRemodel({ ...defaults, vanityType: 'custom' });
    expect(Number(stock.vanityCost)).toBeLessThan(Number(custom.vanityCost));
  });

  // ─── Test 7: Refinish vs full replacement shower ───
  it('refinish costs less than full replacement', () => {
    const refinish = calculateBathroomRemodel({ ...defaults, showerTub: 'refinish' });
    const replace = calculateBathroomRemodel({ ...defaults, showerTub: 'replace' });
    expect(Number(refinish.showerTubCost)).toBeLessThan(Number(replace.showerTubCost));
  });

  // ─── Test 8: Walk-in shower option ───
  it('walk-in shower costs $8,000', () => {
    const result = calculateBathroomRemodel({ ...defaults, showerTub: 'walkin' });
    expect(result.showerTubCost).toBe(8000);
  });

  // ─── Test 9: Basic ceramic tile ───
  it('calculates basic tile at $5/sq ft', () => {
    const result = calculateBathroomRemodel({ ...defaults, tileArea: 100, tileQuality: 'basic' });
    expect(result.tileCost).toBe(500);
  });

  // ─── Test 10: Premium natural stone tile ───
  it('calculates premium tile at $20/sq ft', () => {
    const result = calculateBathroomRemodel({ ...defaults, tileArea: 100, tileQuality: 'premium' });
    expect(result.tileCost).toBe(2000);
  });

  // ─── Test 11: No tile (0 sq ft) ───
  it('returns $0 tile cost when tile area is 0', () => {
    const result = calculateBathroomRemodel({ ...defaults, tileArea: 0 });
    expect(result.tileCost).toBe(0);
  });

  // ─── Test 12: Basic fixtures ───
  it('calculates $350 for basic fixture package', () => {
    const result = calculateBathroomRemodel({ ...defaults, fixtureLevel: 'basic' });
    expect(result.fixtureCost).toBe(350);
  });

  // ─── Test 13: Premium fixtures ───
  it('calculates $2,250 for premium fixture package', () => {
    const result = calculateBathroomRemodel({ ...defaults, fixtureLevel: 'premium' });
    expect(result.fixtureCost).toBe(2250);
  });

  // ─── Test 14: No plumbing changes ───
  it('returns $0 plumbing cost with no changes', () => {
    const result = calculateBathroomRemodel({ ...defaults, plumbingChanges: 'none' });
    expect(result.plumbingCost).toBe(0);
  });

  // ─── Test 15: Major plumbing changes ───
  it('calculates $3,500 for major plumbing changes', () => {
    const result = calculateBathroomRemodel({ ...defaults, plumbingChanges: 'major' });
    expect(result.plumbingCost).toBe(3500);
  });

  // ─── Test 16: Zero bathroom size returns zeros ───
  it('returns all zeros for zero bathroom size', () => {
    const result = calculateBathroomRemodel({ ...defaults, bathroomSize: 0 });
    expect(result.totalCost).toBe(0);
    expect(result.costPerSqFt).toBe(0);
    expect(result.vanityCost).toBe(0);
    expect(result.showerTubCost).toBe(0);
    expect(result.tileCost).toBe(0);
    expect(result.fixtureCost).toBe(0);
    expect(result.plumbingCost).toBe(0);
    expect(result.laborCost).toBe(0);
  });

  // ─── Test 17: All budget options ───
  it('calculates lowest cost with all budget options', () => {
    const budget = calculateBathroomRemodel({
      bathroomSize: 40,
      bathroomType: 'half',
      vanityType: 'stock',
      showerTub: 'none',
      tileArea: 30,
      tileQuality: 'basic',
      fixtureLevel: 'basic',
      plumbingChanges: 'none',
    });
    // Budget half bath should be very affordable
    expect(Number(budget.totalCost)).toBeLessThan(5000);
    expect(Number(budget.totalCost)).toBeGreaterThan(500);
  });

  // ─── Test 18: All premium options ───
  it('calculates highest cost with all premium options', () => {
    const premium = calculateBathroomRemodel({
      bathroomSize: 150,
      bathroomType: 'master',
      vanityType: 'custom',
      showerTub: 'walkin',
      tileArea: 300,
      tileQuality: 'premium',
      fixtureLevel: 'premium',
      plumbingChanges: 'major',
    });
    // Premium master bath should be very expensive
    expect(Number(premium.totalCost)).toBeGreaterThan(25000);
  });

  // ─── Test 19: Cost per sq ft = total / size ───
  it('cost per sq ft equals total divided by bathroom size', () => {
    const result = calculateBathroomRemodel(defaults);
    const expected = parseFloat((Number(result.totalCost) / 75).toFixed(2));
    expect(result.costPerSqFt).toBe(expected);
  });

  // ─── Test 20: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateBathroomRemodel(defaults);
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('vanityCost');
    expect(result).toHaveProperty('showerTubCost');
    expect(result).toHaveProperty('tileCost');
    expect(result).toHaveProperty('fixtureCost');
    expect(result).toHaveProperty('plumbingCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 21: Master bath doubles vanity cost specifically ───
  it('master bath mid vanity costs $3,300 (2 x $1,650)', () => {
    const result = calculateBathroomRemodel({
      ...defaults,
      bathroomType: 'master',
      vanityType: 'mid',
    });
    expect(result.vanityCost).toBe(3300);
  });

  // ─── Test 22: Half bath ignores shower selection ───
  it('half bath with walkin shower selection still costs $0 for shower', () => {
    const result = calculateBathroomRemodel({
      ...defaults,
      bathroomType: 'half',
      showerTub: 'walkin',
    });
    expect(result.showerTubCost).toBe(0);
  });

  // ─── Test 23: Labor is 30% of non-tile materials ───
  it('labor cost is 30% of non-tile materials', () => {
    const result = calculateBathroomRemodel(defaults);
    const nonTile =
      Number(result.vanityCost) +
      Number(result.showerTubCost) +
      Number(result.fixtureCost) +
      Number(result.plumbingCost);
    const expectedLabor = parseFloat((nonTile * 0.30).toFixed(2));
    expect(result.laborCost).toBe(expectedLabor);
  });

  // ─── Test 24: Cost breakdown array has correct items ───
  it('cost breakdown has 6 items with correct labels', () => {
    const result = calculateBathroomRemodel(defaults);
    const breakdown = result.costBreakdown as Array<{ label: string; value: number }>;
    expect(breakdown).toHaveLength(6);
    expect(breakdown[0].label).toBe('Vanity');
    expect(breakdown[1].label).toBe('Shower/Tub');
    expect(breakdown[2].label).toBe('Tile & Installation');
    expect(breakdown[3].label).toBe('Fixtures');
    expect(breakdown[4].label).toBe('Plumbing');
    expect(breakdown[5].label).toBe('Labor & Installation');
  });

  // ─── Test 25: Master bath adds 50% to fixture cost ───
  it('master bath fixture cost is 1.5x the base cost', () => {
    const master = calculateBathroomRemodel({ ...defaults, bathroomType: 'master', fixtureLevel: 'mid' });
    const full = calculateBathroomRemodel({ ...defaults, bathroomType: 'full', fixtureLevel: 'mid' });
    expect(Number(master.fixtureCost)).toBe(Number(full.fixtureCost) * 1.5);
  });
});
