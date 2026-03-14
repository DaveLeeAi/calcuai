import { calculateArtificialTurfCost } from '../../../lib/formulas/construction/artificial-turf-cost';

describe('calculateArtificialTurfCost', () => {
  // ─── Test 1: Default inputs — standard 1000 sqft, mid-range, crumb-rubber, standard prep, no drainage, national ───
  it('calculates default artificial turf at national average', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'standard',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 1000×5×1.25=6250 low, 1000×8×1.25=10000 high
    // Infill: 1000×0.50=500 low, 1000×1.00=1000 high
    // BasePrep: material × (1.15-1) = 6250×0.15=937.5 low, 10000×0.15=1500 high
    // Drainage: 0
    // Labor: materialLow×0.35×1.0=6250×0.35=2187.5 low, materialHigh×0.35=10000×0.35=3500 high
    // TotalLow: 6250+500+937.5+0+2187.5 = 9875
    // TotalHigh: 10000+1000+1500+0+3500 = 16000
    expect(result.totalLow).toBeCloseTo(9875, 0);
    expect(result.totalHigh).toBeCloseTo(16000, 0);
    expect(result.totalMid).toBeCloseTo((9875 + 16000) / 2, 0);
  });

  // ─── Test 2: Small area (200 sqft), economy turf ───
  it('calculates small area (200 sqft) with economy turf', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'small-200sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 200×5×1.0=1000 low, 200×8×1.0=1600 high
    // Infill: 200×0.50=100 low, 200×1.00=200 high
    // BasePrep: minimal = 0 (multiplier 1.0, adds 0)
    // Labor: 1000×0.35=350 low, 1600×0.35=560 high
    // Total: 1000+100+0+0+350=1450 low, 1600+200+0+0+560=2360 high
    expect(result.totalLow).toBeCloseTo(1450, 0);
    expect(result.totalHigh).toBeCloseTo(2360, 0);
  });

  // ─── Test 3: Medium area (500 sqft) ───
  it('calculates medium area (500 sqft) costs', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'medium-500sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 500×5=2500 low, 500×8=4000 high
    // Infill: 500×0.50=250 low, 500×1.00=500 high
    // Labor: 2500×0.35=875 low, 4000×0.35=1400 high
    // Total: 2500+250+0+0+875=3625 low, 4000+500+0+0+1400=5900 high
    expect(result.totalLow).toBeCloseTo(3625, 0);
    expect(result.totalHigh).toBeCloseTo(5900, 0);
  });

  // ─── Test 4: Large area (2000 sqft) gets volume discount rate ───
  it('calculates large area (2000 sqft) with volume discount rate ($4–$7)', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'large-2000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 2000×4=8000 low, 2000×7=14000 high
    // Infill: 2000×0.50=1000 low, 2000×1.00=2000 high
    // Labor: 8000×0.35=2800 low, 14000×0.35=4900 high
    // Total: 8000+1000+0+0+2800=11800 low, 14000+2000+0+0+4900=20900 high
    expect(result.totalLow).toBeCloseTo(11800, 0);
    expect(result.totalHigh).toBeCloseTo(20900, 0);
  });

  // ─── Test 5: Extra large area (5000 sqft) ───
  it('calculates extra large area (5000 sqft) costs', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'xlarge-5000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 5000×4=20000 low, 5000×7=35000 high
    // Infill: 5000×0.50=2500 low, 5000×1.00=5000 high
    // Labor: 20000×0.35=7000 low, 35000×0.35=12250 high
    // Total: 20000+2500+0+0+7000=29500 low, 35000+5000+0+0+12250=52250 high
    expect(result.totalLow).toBeCloseTo(29500, 0);
    expect(result.totalHigh).toBeCloseTo(52250, 0);
  });

  // ─── Test 6: Premium turf quality (1.60x multiplier) ───
  it('applies premium turf quality multiplier (1.60x)', () => {
    const economy = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const premium = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'premium',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Premium material: 1000×5×1.60=8000 low, 1000×8×1.60=12800 high
    // Infill: 500 low, 1000 high
    // Labor: 8000×0.35=2800 low, 12800×0.35=4480 high
    // Total: 8000+500+0+0+2800=11300 low, 12800+1000+0+0+4480=18280 high
    expect(premium.totalLow).toBeCloseTo(11300, 0);
    expect(premium.totalHigh).toBeCloseTo(18280, 0);
    expect(premium.materialCost as number).toBeGreaterThan(economy.materialCost as number);
  });

  // ─── Test 7: Sport-grade turf (2.0x multiplier) ───
  it('applies sport-grade turf multiplier (2.0x)', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'sport-grade',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 1000×5×2.0=10000 low, 1000×8×2.0=16000 high
    // Infill: 500 low, 1000 high
    // Labor: 10000×0.35=3500 low, 16000×0.35=5600 high
    // Total: 10000+500+0+0+3500=14000 low, 16000+1000+0+0+5600=22600 high
    expect(result.totalLow).toBeCloseTo(14000, 0);
    expect(result.totalHigh).toBeCloseTo(22600, 0);
  });

  // ─── Test 8: Silica sand infill ($0.75–$1.25/sqft) ───
  it('calculates silica sand infill cost ($0.75–$1.25/sqft)', () => {
    const crumb = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const silica = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'silica-sand',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Silica infill: 1000×0.75=750 low, 1000×1.25=1250 high
    expect(silica.infillCost).toBeCloseTo(1000, 0); // (750+1250)/2
    expect(silica.totalLow as number).toBeGreaterThan(crumb.totalLow as number);
  });

  // ─── Test 9: Zeolite infill ($1.25–$2.50/sqft) ───
  it('calculates zeolite infill cost ($1.25–$2.50/sqft)', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'zeolite',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Zeolite infill: 1000×1.25=1250 low, 1000×2.50=2500 high
    expect(result.infillCost).toBeCloseTo(1875, 0); // (1250+2500)/2
  });

  // ─── Test 10: Extensive base prep (1.35x multiplier) ───
  it('applies extensive base prep multiplier (1.35x on material)', () => {
    const minimal = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const extensive = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'extensive',
      drainageSystem: 'none',
      region: 'national',
    });
    // Material: 5000 low, 8000 high
    // BasePrepCost extensive: 5000×0.35=1750 low, 8000×0.35=2800 high
    expect(extensive.basePrepCost as number).toBeGreaterThan(0);
    expect(extensive.totalLow as number).toBeGreaterThan(minimal.totalLow as number);
  });

  // ─── Test 11: Basic perforated drainage ($0.50–$1.00/sqft) ───
  it('adds basic perforated drainage cost ($0.50–$1.00/sqft)', () => {
    const none = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const basic = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'basic-perforated',
      region: 'national',
    });
    // Drainage: 1000×0.50=500 low, 1000×1.00=1000 high
    expect(basic.drainageCost).toBeCloseTo(750, 0); // (500+1000)/2
    expect(basic.totalLow as number).toBeCloseTo((none.totalLow as number) + 500, 0);
    expect(basic.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 1000, 0);
  });

  // ─── Test 12: Full drain board ($1.50–$3.00/sqft) ───
  it('adds full drain board cost ($1.50–$3.00/sqft)', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'full-drain-board',
      region: 'national',
    });
    // Drainage: 1000×1.50=1500 low, 1000×3.00=3000 high
    expect(result.drainageCost).toBeCloseTo(2250, 0); // (1500+3000)/2
  });

  // ─── Test 13: Northeast regional multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const northeast = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'northeast',
    });
    expect(northeast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.20, 0);
  });

  // ─── Test 14: West Coast regional multiplier (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const westCoast = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'west-coast',
    });
    expect(westCoast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.25, 0);
  });

  // ─── Test 15: South regional multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const south = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'south',
    });
    expect(south.laborCost as number).toBeCloseTo((national.laborCost as number) * 0.85, 0);
    expect(south.totalLow as number).toBeLessThan(national.totalLow as number);
  });

  // ─── Test 16: Midwest regional multiplier (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const national = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const midwest = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'midwest',
    });
    expect(midwest.laborCost as number).toBeCloseTo((national.laborCost as number) * 0.90, 0);
  });

  // ─── Test 17: Mid-Atlantic regional multiplier (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const national = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const midAtlantic = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'mid-atlantic',
    });
    expect(midAtlantic.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.15, 0);
  });

  // ─── Test 18: Mountain West regional multiplier (0.95x labor) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const national = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const mountainWest = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'mountain-west',
    });
    expect(mountainWest.laborCost as number).toBeCloseTo((national.laborCost as number) * 0.95, 0);
  });

  // ─── Test 19: Quality comparison returns all 4 grades ───
  it('returns quality comparison with all 4 turf grades', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const comparison = result.qualityComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Economy should be cheapest, sport-grade most expensive
    const economy = comparison.find(c => c.label.includes('Economy') || c.label.includes('economy'));
    const sportGrade = comparison.find(c => c.label.includes('Sport') || c.label.includes('sport'));
    expect(economy!.value).toBeLessThan(sportGrade!.value);
  });

  // ─── Test 20: Timeline output ───
  it('returns correct project timeline', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'standard',
      drainageSystem: 'none',
      region: 'national',
    });
    expect(result.timeline).toBe('2-5 days');
  });

  // ─── Test 21: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'mid-range',
      infill: 'crumb-rubber',
      basePrepNeeded: 'standard',
      drainageSystem: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('infillCost');
    expect(result).toHaveProperty('basePrepCost');
    expect(result).toHaveProperty('drainageCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('qualityComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 22: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateArtificialTurfCost({});
    // Defaults: standard-1000sqft, mid-range, crumb-rubber, standard, none, national
    expect(result.totalLow).toBeGreaterThan(0);
    expect(result.totalHigh as number).toBeGreaterThan(result.totalLow as number);
    expect(result.totalMid as number).toBeGreaterThan(0);
  });

  // ─── Test 23: Full premium build — xlarge, sport-grade, zeolite, extensive, full drain, west coast ───
  it('calculates fully loaded premium sport-grade project', () => {
    const result = calculateArtificialTurfCost({
      areaSize: 'xlarge-5000sqft',
      turfQuality: 'sport-grade',
      infill: 'zeolite',
      basePrepNeeded: 'extensive',
      drainageSystem: 'full-drain-board',
      region: 'west-coast',
    });
    // Material: 5000×4×2.0=40000 low, 5000×7×2.0=70000 high
    // Infill: 5000×1.25=6250 low, 5000×2.50=12500 high
    // BasePrepCost: 40000×0.35=14000 low, 70000×0.35=24500 high
    // Drainage: 5000×1.50=7500 low, 5000×3.00=15000 high
    // Labor: 40000×0.35×1.25=17500 low, 70000×0.35×1.25=30625 high
    // Total: 40000+6250+14000+7500+17500=85250 low
    //        70000+12500+24500+15000+30625=152625 high
    expect(result.totalLow).toBeCloseTo(85250, 0);
    expect(result.totalHigh).toBeCloseTo(152625, 0);
    expect(result.totalLow as number).toBeGreaterThan(50000);
    expect(result.totalHigh as number).toBeGreaterThan(100000);
  });

  // ─── Test 24: Material cost scales with area ───
  it('material cost scales proportionally with area size', () => {
    const medium = calculateArtificialTurfCost({
      areaSize: 'medium-500sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    const standard = calculateArtificialTurfCost({
      areaSize: 'standard-1000sqft',
      turfQuality: 'economy',
      infill: 'crumb-rubber',
      basePrepNeeded: 'minimal',
      drainageSystem: 'none',
      region: 'national',
    });
    // Both use same per-sqft rate ($5–$8), standard is 2× medium
    expect(standard.materialCost as number).toBeCloseTo((medium.materialCost as number) * 2, 0);
  });
});
