import { calculateHvacSize } from '@/lib/formulas/construction/hvac-size';

describe('calculateHvacSize', () => {
  // ─── Test 1: Standard 1500 sq ft, mixed climate, average everything ───
  it('calculates standard 1500 sq ft home correctly', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // baseBTU = 1500 × 20 = 30000, all multipliers = 1.0
    expect(result.btuRequired).toBe(30000);
    expect(result.tons).toBe(2.5);
    expect(result.recommendedTons).toBe(2.5);
    expect(result.recommendedUnit).toBe('2.5-ton system');
  });

  // ─── Test 2: Large home (3000 sq ft) ───
  it('calculates large 3000 sq ft home', () => {
    const result = calculateHvacSize({
      squareFootage: 3000,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    expect(result.btuRequired).toBe(60000);
    expect(result.tons).toBe(5);
    expect(result.recommendedTons).toBe(5);
  });

  // ─── Test 3: Small condo (800 sq ft) ───
  it('calculates small 800 sq ft condo', () => {
    const result = calculateHvacSize({
      squareFootage: 800,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    expect(result.btuRequired).toBe(16000);
    expect(result.tons).toBeCloseTo(1.3, 1);
    expect(result.recommendedTons).toBe(1.5);
  });

  // ─── Test 4: Hot-humid climate ───
  it('applies hot-humid climate multiplier (1.2)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'hot-humid',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 30000 × 1.2 = 36000
    expect(result.btuRequired).toBe(36000);
    expect(result.tons).toBe(3);
  });

  // ─── Test 5: Very-cold climate ───
  it('applies very-cold climate multiplier (1.25)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'very-cold',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 30000 × 1.25 = 37500
    expect(result.btuRequired).toBe(37500);
  });

  // ─── Test 6: Poor insulation ───
  it('applies poor insulation multiplier (1.3)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'poor',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 30000 × 1.3 = 39000
    expect(result.btuRequired).toBe(39000);
  });

  // ─── Test 7: Excellent insulation ───
  it('applies excellent insulation multiplier (0.75)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'excellent',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 30000 × 0.75 = 22500
    expect(result.btuRequired).toBe(22500);
  });

  // ─── Test 8: High ceilings (10 ft) ───
  it('applies ceiling height multiplier (10/8 = 1.25)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 10,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 30000 × (10/8) = 30000 × 1.25 = 37500
    expect(result.btuRequired).toBe(37500);
  });

  // ─── Test 9: 2-story home ───
  it('applies 2-story multiplier (1.1)', () => {
    const result = calculateHvacSize({
      squareFootage: 2000,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '2',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 40000 × 1.1 = 44000
    expect(result.btuRequired).toBe(44000);
  });

  // ─── Test 10: 3-story home ───
  it('applies 3-story multiplier (1.15)', () => {
    const result = calculateHvacSize({
      squareFootage: 2000,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '3',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 40000 × 1.15 = 46000
    expect(result.btuRequired).toBe(46000);
  });

  // ─── Test 11: Many windows + full sun ───
  it('applies many windows (1.15) and full sun (1.1)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'many',
      sunExposure: 'full-sun',
    });
    // 30000 × 1.15 × 1.1 = 37950
    expect(result.btuRequired).toBe(37950);
  });

  // ─── Test 12: Shaded + few windows (lowest multipliers) ───
  it('applies shaded (0.9) and few windows (0.9)', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'few',
      sunExposure: 'shaded',
    });
    // 30000 × 0.9 × 0.9 = 24300
    expect(result.btuRequired).toBe(24300);
  });

  // ─── Test 13: Zero square footage returns zeros ───
  it('returns zeros for 0 sq ft', () => {
    const result = calculateHvacSize({
      squareFootage: 0,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    expect(result.btuRequired).toBe(0);
    expect(result.tons).toBe(0);
    expect(result.recommendedTons).toBe(0);
    expect(result.cfmAirflow).toBe(0);
    expect(result.cubicFeet).toBe(0);
  });

  // ─── Test 14: Tonnage rounding to nearest 0.5 ───
  it('rounds tonnage to nearest 0.5', () => {
    // 1200 sq ft → 24000 BTU → 2.0 tons exactly
    const exact = calculateHvacSize({
      squareFootage: 1200, ceilingHeight: 8, climate: 'mixed',
      insulation: 'average', stories: '1', windows: 'average', sunExposure: 'partial',
    });
    expect(exact.recommendedTons).toBe(2);

    // 1800 sq ft → 36000 BTU → 3.0 tons exactly
    const three = calculateHvacSize({
      squareFootage: 1800, ceilingHeight: 8, climate: 'mixed',
      insulation: 'average', stories: '1', windows: 'average', sunExposure: 'partial',
    });
    expect(three.recommendedTons).toBe(3);
  });

  // ─── Test 15: BTU accuracy with all multipliers combined ───
  it('applies all multipliers combined correctly', () => {
    const result = calculateHvacSize({
      squareFootage: 2000,
      ceilingHeight: 10,
      climate: 'hot-humid',
      insulation: 'poor',
      stories: '2',
      windows: 'many',
      sunExposure: 'full-sun',
    });
    // base = 2000 × 20 = 40000
    // × 1.2 (hot-humid) × 1.3 (poor) × 1.25 (10ft ceiling) × 1.1 (2-story) × 1.15 (many windows) × 1.1 (full-sun)
    const expected = 40000 * 1.2 * 1.3 * 1.25 * 1.1 * 1.15 * 1.1;
    expect(result.btuRequired).toBe(Math.round(expected));
  });

  // ─── Test 16: CFM airflow estimate ───
  it('calculates CFM as BTU / 30', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    // 30000 / 30 = 1000 CFM
    expect(result.cfmAirflow).toBe(1000);
  });

  // ─── Test 17: Cost estimate structure ───
  it('returns cost estimate value group with 3 items', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    const costs = result.costEstimate as Array<{ label: string; value: number }>;
    expect(costs).toHaveLength(3);
    expect(costs[0].label).toContain('Central AC');
    expect(costs[1].label).toContain('Heat Pump');
    expect(costs[2].label).toContain('Installation');
    // Heat pump should cost more than central AC
    expect(costs[1].value).toBeGreaterThan(costs[0].value);
  });

  // ─── Test 18: Energy estimate structure ───
  it('returns energy estimate value group', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    const energy = result.energyEstimate as Array<{ label: string; value: number }>;
    expect(energy).toHaveLength(2);
    expect(energy[0].label).toContain('Cooling');
    expect(energy[1].label).toContain('Heating');
    expect(energy[0].value).toBeGreaterThan(0);
    expect(energy[1].value).toBeGreaterThan(0);
  });

  // ─── Test 19: Cubic feet calculation ───
  it('calculates cubic feet as sqft × ceiling height', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 9,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    expect(result.cubicFeet).toBe(13500);
  });

  // ─── Test 20: Output structure contains all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateHvacSize({
      squareFootage: 1500,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    expect(result).toHaveProperty('btuRequired');
    expect(result).toHaveProperty('tons');
    expect(result).toHaveProperty('recommendedTons');
    expect(result).toHaveProperty('recommendedUnit');
    expect(result).toHaveProperty('cubicFeet');
    expect(result).toHaveProperty('cfmAirflow');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('energyEstimate');
  });

  // ─── Test 21: Very large area (5000 sq ft) ───
  it('handles very large 5000 sq ft area', () => {
    const result = calculateHvacSize({
      squareFootage: 5000,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'average',
      stories: '1',
      windows: 'average',
      sunExposure: 'partial',
    });
    expect(result.btuRequired).toBe(100000);
    expect(result.tons).toBeCloseTo(8.3, 1);
  });

  // ─── Test 22: Excellent insulation in mild climate (minimum load) ───
  it('calculates minimum load with best conditions', () => {
    const result = calculateHvacSize({
      squareFootage: 1000,
      ceilingHeight: 8,
      climate: 'mixed',
      insulation: 'excellent',
      stories: '1',
      windows: 'few',
      sunExposure: 'shaded',
    });
    // 20000 × 0.75 × 0.9 × 0.9 = 12150
    expect(result.btuRequired).toBe(12150);
    expect(result.recommendedTons).toBe(1);
  });
});
