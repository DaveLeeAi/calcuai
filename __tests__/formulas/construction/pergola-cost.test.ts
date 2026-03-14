import { calculatePergolaCost } from '../../../lib/formulas/construction/pergola-cost';

describe('calculatePergolaCost', () => {
  // ─── Test 1: Default inputs — medium-10x12, pressure-treated-wood, open-rafter, surface-mount, no electrical, national ───
  it('calculates default pergola at national average', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12',
      material: 'pressure-treated-wood',
      roofType: 'open-rafter',
      foundation: 'surface-mount',
      electricalOutlet: 'none',
      region: 'national',
    });
    // Structure: $3500–$7000 × 1.0 = $3500–$7000
    // Labor: $3500×0.50=$1750 low, $7000×0.50=$3500 high (×1.0 national)
    // Roof: $0, Electrical: $0
    // Subtotal: 3500+1750=$5250 low, 7000+3500=$10500 high
    // Foundation: ×1.0
    // TotalLow: $5250, TotalHigh: $10500
    expect(result.totalLow).toBeCloseTo(5250, 0);
    expect(result.totalHigh).toBeCloseTo(10500, 0);
    expect(result.totalMid).toBeCloseTo(7875, 0);
    expect(result.sqft).toBe(120);
    expect(result.structureCost).toBeCloseTo(5250, 0); // (3500+7000)/2
    expect(result.laborCost).toBeCloseTo(2625, 0); // (1750+3500)/2
    expect(result.roofCost).toBe(0);
    expect(result.electricalCost).toBe(0);
    expect(result.foundationAdj).toBe(0);
  });

  // ─── Test 2: Small 8x8 size ───
  it('calculates small 8x8 pergola costs', () => {
    const result = calculatePergolaCost({
      size: 'small-8x8', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $2000–$4000, Labor: $1000–$2000
    // TotalLow: 2000+1000=$3000, TotalHigh: 4000+2000=$6000
    expect(result.sqft).toBe(64);
    expect(result.totalLow).toBeCloseTo(3000, 0);
    expect(result.totalHigh).toBeCloseTo(6000, 0);
  });

  // ─── Test 3: Large 12x16 size ───
  it('calculates large 12x16 pergola costs', () => {
    const result = calculatePergolaCost({
      size: 'large-12x16', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $5500–$11000, Labor: $2750–$5500
    expect(result.sqft).toBe(192);
    expect(result.totalLow).toBeCloseTo(8250, 0);
    expect(result.totalHigh).toBeCloseTo(16500, 0);
  });

  // ─── Test 4: Extra large 14x20 size ───
  it('calculates xlarge 14x20 pergola costs', () => {
    const result = calculatePergolaCost({
      size: 'xlarge-14x20', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(result.sqft).toBe(280);
    expect(result.totalLow).toBeCloseTo(12000, 0);
    expect(result.totalHigh).toBeCloseTo(24000, 0);
  });

  // ─── Test 5: Cedar material multiplier (1.30x) ───
  it('applies cedar material multiplier (1.30x) to structure cost', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'cedar', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $3500×1.30=$4550 low, $7000×1.30=$9100 high
    // Labor: $4550×0.50=$2275 low, $9100×0.50=$4550 high
    expect(result.totalLow).toBeCloseTo(6825, 0);
    expect(result.totalHigh).toBeCloseTo(13650, 0);
  });

  // ─── Test 6: Redwood material multiplier (1.50x) ───
  it('applies redwood material multiplier (1.50x) to structure cost', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'redwood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $3500×1.50=$5250 low, $7000×1.50=$10500 high
    // Labor: $5250×0.50=$2625 low, $10500×0.50=$5250 high
    expect(result.totalLow).toBeCloseTo(7875, 0);
    expect(result.totalHigh).toBeCloseTo(15750, 0);
  });

  // ─── Test 7: Vinyl material multiplier (1.20x) ───
  it('applies vinyl material multiplier (1.20x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'vinyl', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $3500×1.20=$4200 low, $7000×1.20=$8400 high
    // Labor: $4200×0.50=$2100 low, $8400×0.50=$4200 high
    expect(result.totalLow).toBeCloseTo(6300, 0);
    expect(result.totalHigh).toBeCloseTo(12600, 0);
  });

  // ─── Test 8: Aluminum material multiplier (1.35x) ───
  it('applies aluminum material multiplier (1.35x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'aluminum', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $3500×1.35=$4725 low, $7000×1.35=$9450 high
    // Labor: $4725×0.50=$2362.50 low, $9450×0.50=$4725 high
    expect(result.totalLow).toBeCloseTo(7087.5, 0);
    expect(result.totalHigh).toBeCloseTo(14175, 0);
  });

  // ─── Test 9: Fiberglass material multiplier (1.40x) ───
  it('applies fiberglass material multiplier (1.40x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'fiberglass', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // Structure: $3500×1.40=$4900 low, $7000×1.40=$9800 high
    // Labor: $4900×0.50=$2450 low, $9800×0.50=$4900 high
    expect(result.totalLow).toBeCloseTo(7350, 0);
    expect(result.totalHigh).toBeCloseTo(14700, 0);
  });

  // ─── Test 10: Shade slats roof type add-on ($500–$1500) ───
  it('adds shade slats roof cost ($500–$1500)', () => {
    const noRoof = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    const slats = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'shade-slats',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(slats.roofCost).toBeCloseTo(1000, 0); // (500+1500)/2
    expect(slats.totalLow as number).toBeCloseTo((noRoof.totalLow as number) + 500, 0);
    expect(slats.totalHigh as number).toBeCloseTo((noRoof.totalHigh as number) + 1500, 0);
  });

  // ─── Test 11: Polycarbonate roof type add-on ($1000–$2500) ───
  it('adds polycarbonate roof cost ($1000–$2500)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'polycarbonate-roof',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(result.roofCost).toBeCloseTo(1750, 0);
    // TotalLow: 3500 + 1750 + 1000 + 0 = 6250
    expect(result.totalLow).toBeCloseTo(6250, 0);
  });

  // ─── Test 12: Retractable canopy roof type add-on ($1500–$3500) ───
  it('adds retractable canopy roof cost ($1500–$3500)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'retractable-canopy',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(result.roofCost).toBeCloseTo(2500, 0);
    // TotalLow: 3500 + 1750 + 1500 + 0 = 6750
    expect(result.totalLow).toBeCloseTo(6750, 0);
  });

  // ─── Test 13: Concrete footings foundation (1.15x) ───
  it('applies concrete footings foundation multiplier (1.15x)', () => {
    const surface = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    const footings = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'concrete-footings', electricalOutlet: 'none', region: 'national',
    });
    // Foundation multiplier applied to subtotal
    expect(footings.totalLow).toBeCloseTo(5250 * 1.15, 0);
    expect(footings.totalHigh).toBeCloseTo(10500 * 1.15, 0);
    expect(footings.foundationAdj as number).toBeGreaterThan(0);
  });

  // ─── Test 14: Deck mount foundation (1.05x) ───
  it('applies deck mount foundation multiplier (1.05x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'deck-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(result.totalLow).toBeCloseTo(5250 * 1.05, 0);
    expect(result.totalHigh).toBeCloseTo(10500 * 1.05, 0);
  });

  // ─── Test 15: Basic outlet electrical add-on ($200–$400) ───
  it('adds basic outlet electrical cost ($200–$400)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'basic-outlet', region: 'national',
    });
    expect(result.electricalCost).toBeCloseTo(300, 0);
    expect(result.totalLow).toBeCloseTo(5250 + 200, 0);
    expect(result.totalHigh).toBeCloseTo(10500 + 400, 0);
  });

  // ─── Test 16: Fan and lights electrical add-on ($500–$1200) ───
  it('adds fan-and-lights electrical cost ($500–$1200)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'fan-and-lights', region: 'national',
    });
    expect(result.electricalCost).toBeCloseTo(850, 0);
    expect(result.totalLow).toBeCloseTo(5250 + 500, 0);
    expect(result.totalHigh).toBeCloseTo(10500 + 1200, 0);
  });

  // ─── Test 17: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    const northeast = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'northeast',
    });
    // Structure stays same
    expect(northeast.structureCost).toBeCloseTo(national.structureCost as number, 0);
    // Labor: national $2625 mid, northeast = $2625 × 1.20 = $3150
    expect(northeast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.20, 0);
  });

  // ─── Test 18: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'south',
    });
    // Labor low: 1750 × 0.85 = 1487.50, high: 3500 × 0.85 = 2975
    expect(result.totalLow).toBeCloseTo(3500 + 1487.50, 0);
    expect(result.totalHigh).toBeCloseTo(7000 + 2975, 0);
  });

  // ─── Test 19: West Coast region multiplier (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'west-coast',
    });
    // Labor low: 1750 × 1.25 = 2187.50, high: 3500 × 1.25 = 4375
    expect(result.totalLow).toBeCloseTo(3500 + 2187.50, 0);
    expect(result.totalHigh).toBeCloseTo(7000 + 4375, 0);
  });

  // ─── Test 20: Midwest region multiplier (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'midwest',
    });
    // Labor low: 1750 × 0.90 = 1575, high: 3500 × 0.90 = 3150
    expect(result.totalLow).toBeCloseTo(5075, 0);
    expect(result.totalHigh).toBeCloseTo(10150, 0);
  });

  // ─── Test 21: Mid-Atlantic region multiplier (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'mid-atlantic',
    });
    // Labor low: 1750 × 1.15 = 2012.50, high: 3500 × 1.15 = 4025
    expect(result.totalLow).toBeCloseTo(5512.50, 0);
    expect(result.totalHigh).toBeCloseTo(11025, 0);
  });

  // ─── Test 22: Mountain West region multiplier (0.95x labor) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'mountain-west',
    });
    // Labor low: 1750 × 0.95 = 1662.50, high: 3500 × 0.95 = 3325
    expect(result.totalLow).toBeCloseTo(5162.50, 0);
    expect(result.totalHigh).toBeCloseTo(10325, 0);
  });

  // ─── Test 23: Full build — xlarge, redwood, retractable canopy, concrete footings, fan-and-lights, northeast ───
  it('calculates a fully loaded premium pergola build', () => {
    const result = calculatePergolaCost({
      size: 'xlarge-14x20', material: 'redwood', roofType: 'retractable-canopy',
      foundation: 'concrete-footings', electricalOutlet: 'fan-and-lights', region: 'northeast',
    });
    // Structure: $8000×1.50=$12000 low, $16000×1.50=$24000 high
    // Labor: $12000×0.50×1.20=$7200 low, $24000×0.50×1.20=$14400 high
    // Roof: $1500 low, $3500 high
    // Electrical: $500 low, $1200 high
    // Subtotal: 12000+7200+1500+500=$21200 low, 24000+14400+3500+1200=$43100 high
    // Foundation: ×1.15
    // TotalLow: 21200 × 1.15 = 24380
    // TotalHigh: 43100 × 1.15 = 49565
    expect(result.totalLow).toBeCloseTo(24380, 0);
    expect(result.totalHigh).toBeCloseTo(49565, 0);
    expect(result.totalMid).toBeCloseTo(36972.5, 0);
  });

  // ─── Test 24: Material comparison returns all 6 materials ───
  it('returns material comparison with all 6 materials', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(6);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Pressure-treated should be cheapest, redwood among most expensive
    const ptw = comparison.find(c => c.label.includes('Pressure-Treated'));
    const redwood = comparison.find(c => c.label.includes('Redwood'));
    expect(ptw!.value).toBeLessThan(redwood!.value);
  });

  // ─── Test 25: Timeline output ───
  it('returns correct timeline for each size', () => {
    const small = calculatePergolaCost({
      size: 'small-8x8', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(small.timeline).toBe('2-3 days');

    const xlarge = calculatePergolaCost({
      size: 'xlarge-14x20', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(xlarge.timeline).toBe('5-8 days');
  });

  // ─── Test 26: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    expect(result).toHaveProperty('sqft');
    expect(result).toHaveProperty('structureCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('roofCost');
    expect(result).toHaveProperty('foundationAdj');
    expect(result).toHaveProperty('electricalCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 27: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculatePergolaCost({});
    // Defaults: medium-10x12, pressure-treated-wood, open-rafter, surface-mount, none, national
    expect(result.totalLow).toBeCloseTo(5250, 0);
    expect(result.totalHigh).toBeCloseTo(10500, 0);
  });

  // ─── Test 28: Cost per square foot calculation ───
  it('calculates cost per square foot correctly', () => {
    const result = calculatePergolaCost({
      size: 'medium-10x12', material: 'pressure-treated-wood', roofType: 'open-rafter',
      foundation: 'surface-mount', electricalOutlet: 'none', region: 'national',
    });
    // costPerSqFt = totalMid / sqft = 7875 / 120 = 65.63
    expect(result.costPerSqFt).toBeCloseTo(65.63, 0);
  });
});
