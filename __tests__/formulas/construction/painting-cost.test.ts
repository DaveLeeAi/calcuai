import { calculatePaintingCost } from '@/lib/formulas/construction/painting-cost';

describe('calculatePaintingCost', () => {
  // ─── Test 1: Standard interior walls, 1500 sqft, national, 2-coats, mid-range ───
  it('calculates standard interior walls project at national rates', () => {
    const result = calculatePaintingCost({
      paintArea: 1500,
      paintAreaUnit: 'sqft',
      projectType: 'interior-walls',
      paintQuality: 'mid-range',
      coats: '2-coats',
      preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft',
      region: 'national',
    });
    // Material: 1500 × ($0.65-$1.25) × 1.0 = $975 low, $1875 high
    // Labor: 1500 × ($1.50-$3.00) × 1.0 × 1.0 × 1.0 = $2250 low, $4500 high
    // Prep: 1500 × ($0.50-$1.00) = $750 low, $1500 high
    // TotalLow: 975 + 2250 + 750 = $3975
    // TotalHigh: 1875 + 4500 + 1500 = $7875
    // TotalMid: (3975 + 7875) / 2 = $5925
    expect(result.paintArea).toBe(1500);
    expect(result.totalLow).toBe(3975);
    expect(result.totalHigh).toBe(7875);
    expect(result.totalMid).toBe(5925);
  });

  // ─── Test 2: Builder-grade paint quality ───
  it('calculates builder-grade paint cost', () => {
    const result = calculatePaintingCost({
      paintArea: 1000,
      paintAreaUnit: 'sqft',
      projectType: 'interior-walls',
      paintQuality: 'builder-grade',
      coats: '2-coats',
      preparation: 'minimal-clean',
      ceilingHeight: 'standard-8ft',
      region: 'national',
    });
    // Material: 1000 × ($0.50-$1.00) × 1.0 = $500 low, $1000 high
    // Labor: 1000 × ($1.50-$3.00) × 1.0 × 1.0 × 1.0 = $1500 low, $3000 high
    // Prep: 1000 × ($0.25-$0.50) = $250 low, $500 high
    // TotalLow: 500 + 1500 + 250 = $2250
    // TotalHigh: 1000 + 3000 + 500 = $4500
    expect(result.totalLow).toBe(2250);
    expect(result.totalHigh).toBe(4500);
    expect(result.totalMid).toBe(3375);
  });

  // ─── Test 3: Premium paint quality ───
  it('calculates premium paint cost higher than mid-range', () => {
    const midRange = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const premium = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'premium',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    expect((premium.totalMid as number)).toBeGreaterThan((midRange.totalMid as number));
    // Material should differ, labor should be the same
    expect((premium.laborCost as number)).toBe((midRange.laborCost as number));
    expect((premium.materialCost as number)).toBeGreaterThan((midRange.materialCost as number));
  });

  // ─── Test 4: Interior ceiling adds surcharge ───
  it('adds ceiling surcharge for interior-ceiling project type', () => {
    const walls = calculatePaintingCost({
      paintArea: 500, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const ceiling = calculatePaintingCost({
      paintArea: 500, paintAreaUnit: 'sqft',
      projectType: 'interior-ceiling', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Ceiling adds $1-$2/sqft surcharge to labor
    expect((ceiling.laborCost as number)).toBeGreaterThan((walls.laborCost as number));
    expect((ceiling.materialCost as number)).toBe((walls.materialCost as number));
  });

  // ─── Test 5: Exterior siding labor rates ───
  it('calculates exterior siding with higher labor rates', () => {
    const result = calculatePaintingCost({
      paintArea: 2000, paintAreaUnit: 'sqft',
      projectType: 'exterior-siding', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Labor: 2000 × ($2.00-$4.00) × 1.0 × 1.0 × 1.0 = $4000 low, $8000 high
    // Labor mid: ($4000 + $8000) / 2 = $6000
    expect(result.laborCost).toBe(6000);
  });

  // ─── Test 6: Exterior trim-only highest labor rates ───
  it('calculates exterior trim-only with highest labor rates', () => {
    const result = calculatePaintingCost({
      paintArea: 300, paintAreaUnit: 'sqft',
      projectType: 'exterior-trim-only', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Labor: 300 × ($3.00-$6.00) × 1.0 × 1.0 × 1.0 = $900 low, $1800 high
    // Labor mid: ($900 + $1800) / 2 = $1350
    expect(result.laborCost).toBe(1350);
  });

  // ─── Test 7: 1-coat multiplier (0.75x) ───
  it('applies 1-coat multiplier reducing material and labor', () => {
    const twoCoats = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const oneCoat = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '1-coat', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // 1-coat factor = 0.75, 2-coat factor = 1.0
    // Material and labor should be lower for 1-coat
    expect((oneCoat.materialCost as number)).toBeLessThan((twoCoats.materialCost as number));
    expect((oneCoat.laborCost as number)).toBeLessThan((twoCoats.laborCost as number));
    // Prep cost should be the same
    expect((oneCoat.prepCost as number)).toBe((twoCoats.prepCost as number));
  });

  // ─── Test 8: 3-coats multiplier (1.20x) ───
  it('applies 3-coats multiplier increasing material and labor', () => {
    const twoCoats = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const threeCoats = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '3-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    expect((threeCoats.materialCost as number)).toBeGreaterThan((twoCoats.materialCost as number));
    expect((threeCoats.laborCost as number)).toBeGreaterThan((twoCoats.laborCost as number));
  });

  // ─── Test 9: Minimal prep vs extensive prep ───
  it('extensive prep costs significantly more than minimal', () => {
    const minimal = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'minimal-clean',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const extensive = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'extensive-scrape-repair',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Minimal prep: 1000 × $0.375 avg = $375
    // Extensive prep: 1000 × $2.25 avg = $2250
    expect((extensive.prepCost as number)).toBeGreaterThan((minimal.prepCost as number));
    // Material and labor should be the same
    expect((extensive.materialCost as number)).toBe((minimal.materialCost as number));
    expect((extensive.laborCost as number)).toBe((minimal.laborCost as number));
  });

  // ─── Test 10: Tall ceiling height multiplier (1.15x) ───
  it('applies tall ceiling height multiplier to labor only', () => {
    const standard = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const tall = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'tall-9-10ft', region: 'national',
    });
    // Labor increases by 15%, material stays the same
    expect((tall.laborCost as number)).toBeGreaterThan((standard.laborCost as number));
    expect((tall.materialCost as number)).toBe((standard.materialCost as number));
    // Verify exact labor: standard laborMid = 1000 × (1.50+3.00)/2 × 1.0 = $2250
    // Tall: 1000 × 2.25 × 1.15 = $2587.50
    expect(tall.laborCost).toBeCloseTo(2587.5, 1);
  });

  // ─── Test 11: Extra tall ceiling height multiplier (1.35x) ───
  it('applies extra tall ceiling height multiplier (1.35x)', () => {
    const result = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'extra-tall-12ft', region: 'national',
    });
    // Labor mid: 1000 × (1.50+3.00)/2 × 1.0 × 1.35 × 1.0 = 2250 × 1.35 = $3037.50
    expect(result.laborCost).toBeCloseTo(3037.5, 1);
  });

  // ─── Test 12: Northeast region multiplier (1.20x) ───
  it('applies northeast regional labor multiplier', () => {
    const national = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const northeast = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'northeast',
    });
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect((northeast.materialCost as number)).toBe((national.materialCost as number));
    expect((northeast.prepCost as number)).toBe((national.prepCost as number));
    // Exact: national labor mid = $2250, northeast = $2250 × 1.20 = $2700
    expect(northeast.laborCost).toBeCloseTo(2700, 1);
  });

  // ─── Test 13: South region multiplier (0.85x) ───
  it('applies south regional labor multiplier (cheapest)', () => {
    const national = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const south = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    // Exact: national labor mid = $2250, south = $2250 × 0.85 = $1912.50
    expect(south.laborCost).toBeCloseTo(1912.5, 1);
  });

  // ─── Test 14: West coast region multiplier (most expensive) ───
  it('applies west coast regional labor multiplier (most expensive)', () => {
    const result = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'west-coast',
    });
    // Labor mid: 1000 × 2.25 × 1.0 × 1.0 × 1.25 = $2812.50
    expect(result.laborCost).toBeCloseTo(2812.5, 1);
  });

  // ─── Test 15: Zero area returns zero costs ───
  it('returns zero for zero area', () => {
    const result = calculatePaintingCost({
      paintArea: 0, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    expect(result.paintArea).toBe(0);
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
    expect(result.paintGallonsEstimate).toBe(0);
  });

  // ─── Test 16: Paint gallons estimate ───
  it('calculates paint gallons estimate correctly', () => {
    const result = calculatePaintingCost({
      paintArea: 1750,
      paintAreaUnit: 'sqft',
      projectType: 'interior-walls',
      paintQuality: 'mid-range',
      coats: '2-coats',
      preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft',
      region: 'national',
    });
    // Gallons = (1750 × 2) / 350 = 3500 / 350 = 10
    expect(result.paintGallonsEstimate).toBe(10);
  });

  // ─── Test 17: Paint gallons with 1-coat ───
  it('calculates paint gallons for 1-coat correctly', () => {
    const result = calculatePaintingCost({
      paintArea: 700, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '1-coat', preparation: 'minimal-clean',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Gallons = (700 × 1) / 350 = 2
    expect(result.paintGallonsEstimate).toBe(2);
  });

  // ─── Test 18: Paint gallons with 3-coats ───
  it('calculates paint gallons for 3-coats correctly', () => {
    const result = calculatePaintingCost({
      paintArea: 700, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '3-coats', preparation: 'minimal-clean',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Gallons = (700 × 3) / 350 = 2100 / 350 = 6
    expect(result.paintGallonsEstimate).toBe(6);
  });

  // ─── Test 19: Metric input conversion ───
  it('converts square meters to square feet correctly', () => {
    const result = calculatePaintingCost({
      paintArea: 100,
      paintAreaUnit: 'sqm',
      projectType: 'interior-walls',
      paintQuality: 'mid-range',
      coats: '2-coats',
      preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft',
      region: 'national',
    });
    // 100 sqm × 10.7639 = 1076.39 sqft
    expect(result.paintArea).toBeCloseTo(1076.39, 1);
    expect((result.totalLow as number)).toBeGreaterThan(0);
  });

  // ─── Test 20: Cost per sq ft accuracy ───
  it('calculates cost per sq ft correctly', () => {
    const result = calculatePaintingCost({
      paintArea: 1500, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // totalMid = 5925, area = 1500
    // costPerSqFt = 5925 / 1500 = 3.95
    expect(result.costPerSqFt).toBe(3.95);
  });

  // ─── Test 21: Project type comparison structure ───
  it('returns project type comparison with all 4 types', () => {
    const result = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const comparison = result.projectTypeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
  });

  // ─── Test 22: Interior walls cheapest, exterior trim most expensive ───
  it('interior walls is cheapest and exterior trim most expensive in comparison', () => {
    const result = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const comparison = result.projectTypeComparison as Array<{ label: string; value: number }>;
    const walls = comparison.find(c => c.label.includes('Interior Walls'));
    const trim = comparison.find(c => c.label.includes('Exterior Trim'));
    expect(walls!.value).toBeLessThan(trim!.value);
  });

  // ─── Test 23: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    expect(result).toHaveProperty('paintArea');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('prepCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('projectTypeComparison');
    expect(result).toHaveProperty('paintGallonsEstimate');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 24: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculatePaintingCost({});
    expect(result.paintArea).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.paintGallonsEstimate).toBe(0);
  });

  // ─── Test 25: Regional multiplier only affects labor ───
  it('regional multiplier changes labor but not material or prep cost', () => {
    const national = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'exterior-siding', paintQuality: 'premium',
      coats: '2-coats', preparation: 'extensive-scrape-repair',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const northeast = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'exterior-siding', paintQuality: 'premium',
      coats: '2-coats', preparation: 'extensive-scrape-repair',
      ceilingHeight: 'standard-8ft', region: 'northeast',
    });
    expect(national.materialCost).toBe(northeast.materialCost);
    expect(national.prepCost).toBe(northeast.prepCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });

  // ─── Test 26: Timeline estimation ───
  it('returns correct timeline for different areas', () => {
    const small = calculatePaintingCost({
      paintArea: 400, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const large = calculatePaintingCost({
      paintArea: 3500, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    expect(small.timeline).toBe('1 day');
    expect(large.timeline).toBe('3–5 days');
  });

  // ─── Test 27: Exterior timeline longer than interior ───
  it('exterior projects have longer timeline than interior for same area', () => {
    const interior = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const exterior = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'exterior-siding', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // 1000 sqft interior = '1–2 days', exterior = '2–4 days'
    expect(interior.timeline).toBe('1–2 days');
    expect(exterior.timeline).toBe('2–4 days');
  });

  // ─── Test 28: Exact prep cost calculation ───
  it('calculates exact prep costs for each level', () => {
    const minimal = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'minimal-clean',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const standard = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    const extensive = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '2-coats', preparation: 'extensive-scrape-repair',
      ceilingHeight: 'standard-8ft', region: 'national',
    });
    // Minimal: 1000 × ($0.25+$0.50)/2 = $375
    // Standard: 1000 × ($0.50+$1.00)/2 = $750
    // Extensive: 1000 × ($1.50+$3.00)/2 = $2250
    expect(minimal.prepCost).toBe(375);
    expect(standard.prepCost).toBe(750);
    expect(extensive.prepCost).toBe(2250);
  });

  // ─── Test 29: Combined multipliers stack ───
  it('stacks ceiling height, coats, and region multipliers on labor', () => {
    const result = calculatePaintingCost({
      paintArea: 1000, paintAreaUnit: 'sqft',
      projectType: 'interior-walls', paintQuality: 'mid-range',
      coats: '3-coats', preparation: 'standard-sand-prime',
      ceilingHeight: 'tall-9-10ft', region: 'northeast',
    });
    // Labor low: 1000 × $1.50 × 1.20 × 1.15 × 1.20 = $2484.00
    // Labor high: 1000 × $3.00 × 1.20 × 1.15 × 1.20 = $4968.00
    // Labor mid: (2484 + 4968) / 2 = $3726.00
    expect(result.laborCost).toBeCloseTo(3726.0, 0);
  });

  // ─── Test 30: Large exterior project ───
  it('handles large exterior project (5000 sqft)', () => {
    const result = calculatePaintingCost({
      paintArea: 5000, paintAreaUnit: 'sqft',
      projectType: 'exterior-siding', paintQuality: 'premium',
      coats: '2-coats', preparation: 'extensive-scrape-repair',
      ceilingHeight: 'standard-8ft', region: 'west-coast',
    });
    // Material: 5000 × ($0.85-$1.75) × 1.0 = $4250 low, $8750 high
    // Labor: 5000 × ($2.00-$4.00) × 1.0 × 1.0 × 1.25 = $12500 low, $25000 high
    // Prep: 5000 × ($1.50-$3.00) = $7500 low, $15000 high
    // TotalLow: 4250 + 12500 + 7500 = $24250
    // TotalHigh: 8750 + 25000 + 15000 = $48750
    expect(result.totalLow).toBe(24250);
    expect(result.totalHigh).toBe(48750);
    expect(result.totalMid).toBe(36500);
    // Gallons: (5000 × 2) / 350 ≈ 28.57
    expect(result.paintGallonsEstimate).toBeCloseTo(28.57, 1);
    expect(result.timeline).toBe('5–10 days');
  });
});
