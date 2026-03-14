import { calculateCrawlSpaceEncapsulationCost } from '../../../lib/formulas/construction/crawl-space-encapsulation-cost';

describe('calculateCrawlSpaceEncapsulationCost', () => {
  // ─── Test 1: Default inputs — standard size, 6-mil barrier, no drainage, no dehumidifier, no insulation, national ───
  it('calculates default crawl space encapsulation at national average', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Base: $5000–$10000, barrier mult 1.0 → barrierCost: $5000–$10000
    // Labor: 5000×0.40×1.0=2000 low, 10000×0.40×1.0=4000 high
    // Total: 5000+2000=7000 low, 10000+4000=14000 high
    expect(result.totalLow).toBeCloseTo(7000, 0);
    expect(result.totalHigh).toBeCloseTo(14000, 0);
    expect(result.totalMid).toBeCloseTo(10500, 0);
    expect(result.drainageCost).toBe(0);
    expect(result.dehumidifierCost).toBe(0);
    expect(result.insulationCost).toBe(0);
  });

  // ─── Test 2: Small crawl space ($2000–$4000 base) ───
  it('calculates small crawl space (500 sq ft) costs', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'small-500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Base: 2000–4000, labor: 2000×0.4=800 low, 4000×0.4=1600 high
    // Total: 2000+800=2800 low, 4000+1600=5600 high
    expect(result.totalLow).toBeCloseTo(2800, 0);
    expect(result.totalHigh).toBeCloseTo(5600, 0);
    expect(result.totalMid).toBeCloseTo(4200, 0);
  });

  // ─── Test 3: Medium crawl space ($3500–$7000 base) ───
  it('calculates medium crawl space (1000 sq ft) costs', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'medium-1000sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Base: 3500–7000, labor: 3500×0.4=1400 low, 7000×0.4=2800 high
    // Total: 3500+1400=4900 low, 7000+2800=9800 high
    expect(result.totalLow).toBeCloseTo(4900, 0);
    expect(result.totalHigh).toBeCloseTo(9800, 0);
  });

  // ─── Test 4: Large crawl space ($7000–$14000 base) ───
  it('calculates large crawl space (2000 sq ft) costs', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'large-2000sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Base: 7000–14000, labor: 7000×0.4=2800 low, 14000×0.4=5600 high
    // Total: 7000+2800=9800 low, 14000+5600=19600 high
    expect(result.totalLow).toBeCloseTo(9800, 0);
    expect(result.totalHigh).toBeCloseTo(19600, 0);
  });

  // ─── Test 5: Extra large crawl space ($9000–$18000 base) ───
  it('calculates extra large crawl space (2500 sq ft) costs', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'xlarge-2500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Base: 9000–18000, labor: 9000×0.4=3600 low, 18000×0.4=7200 high
    // Total: 9000+3600=12600 low, 18000+7200=25200 high
    expect(result.totalLow).toBeCloseTo(12600, 0);
    expect(result.totalHigh).toBeCloseTo(25200, 0);
  });

  // ─── Test 6: 12-mil reinforced barrier multiplier (1.15x) ───
  it('applies 12-mil reinforced barrier multiplier (1.15x)', () => {
    const standard = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const reinforced = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '12-mil-reinforced',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Barrier-adjusted base: 5000×1.15=5750 low, 10000×1.15=11500 high
    // Labor stays on raw base: 5000×0.4×1.0=2000 low, 10000×0.4×1.0=4000 high
    // Total: 5750+2000=7750 low, 11500+4000=15500 high
    expect(reinforced.totalLow).toBeCloseTo(7750, 0);
    expect(reinforced.totalHigh).toBeCloseTo(15500, 0);
    expect(reinforced.totalLow as number).toBeGreaterThan(standard.totalLow as number);
  });

  // ─── Test 7: 20-mil premium barrier multiplier (1.30x) ───
  it('applies 20-mil premium barrier multiplier (1.30x)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '20-mil-premium',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    // Barrier-adjusted base: 5000×1.30=6500 low, 10000×1.30=13000 high
    // Labor on raw base: 2000 low, 4000 high
    // Total: 6500+2000=8500 low, 13000+4000=17000 high
    expect(result.totalLow).toBeCloseTo(8500, 0);
    expect(result.totalHigh).toBeCloseTo(17000, 0);
  });

  // ─── Test 8: Interior drain add-on ($800–$1500) ───
  it('adds interior drain cost ($800–$1500)', () => {
    const none = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const drain = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'interior-drain',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    expect(drain.drainageCost).toBeCloseTo(1150, 0); // (800+1500)/2
    expect(drain.totalLow as number).toBeCloseTo((none.totalLow as number) + 800, 0);
    expect(drain.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 1500, 0);
  });

  // ─── Test 9: Sump pump add-on ($1200–$2500) ───
  it('adds sump pump drainage cost ($1200–$2500)', () => {
    const none = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const sump = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'sump-pump',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    expect(sump.drainageCost).toBeCloseTo(1850, 0); // (1200+2500)/2
    expect(sump.totalLow as number).toBeCloseTo((none.totalLow as number) + 1200, 0);
    expect(sump.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 2500, 0);
  });

  // ─── Test 10: Portable dehumidifier ($300–$600) ───
  it('adds portable dehumidifier cost ($300–$600)', () => {
    const none = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const portable = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'portable',
      insulation: 'none',
      region: 'national',
    });
    expect(portable.dehumidifierCost).toBeCloseTo(450, 0); // (300+600)/2
    expect(portable.totalLow as number).toBeCloseTo((none.totalLow as number) + 300, 0);
    expect(portable.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 600, 0);
  });

  // ─── Test 11: Commercial-grade dehumidifier ($1500–$3000) ───
  it('adds commercial-grade dehumidifier cost ($1500–$3000)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'commercial-grade',
      insulation: 'none',
      region: 'national',
    });
    expect(result.dehumidifierCost).toBeCloseTo(2250, 0); // (1500+3000)/2
    expect(result.totalLow).toBeCloseTo(7000 + 1500, 0);
    expect(result.totalHigh).toBeCloseTo(14000 + 3000, 0);
  });

  // ─── Test 12: Fiberglass batt insulation ($500–$1000) ───
  it('adds fiberglass batt insulation cost ($500–$1000)', () => {
    const none = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const fiber = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'fiberglass-batt',
      region: 'national',
    });
    expect(fiber.insulationCost).toBeCloseTo(750, 0); // (500+1000)/2
    expect(fiber.totalLow as number).toBeCloseTo((none.totalLow as number) + 500, 0);
    expect(fiber.totalHigh as number).toBeCloseTo((none.totalHigh as number) + 1000, 0);
  });

  // ─── Test 13: Rigid foam insulation ($800–$1500) ───
  it('adds rigid foam insulation cost ($800–$1500)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'rigid-foam',
      region: 'national',
    });
    expect(result.insulationCost).toBeCloseTo(1150, 0); // (800+1500)/2
    expect(result.totalLow).toBeCloseTo(7000 + 800, 0);
    expect(result.totalHigh).toBeCloseTo(14000 + 1500, 0);
  });

  // ─── Test 14: Spray foam insulation ($1500–$3000) ───
  it('adds spray foam insulation cost ($1500–$3000)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'spray-foam',
      region: 'national',
    });
    expect(result.insulationCost).toBeCloseTo(2250, 0); // (1500+3000)/2
    expect(result.totalLow).toBeCloseTo(7000 + 1500, 0);
    expect(result.totalHigh).toBeCloseTo(14000 + 3000, 0);
  });

  // ─── Test 15: Northeast regional multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const northeast = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'northeast',
    });
    // Labor national: (2000+4000)/2=3000 mid, northeast: 3000×1.20=3600
    expect(northeast.laborCost as number).toBeCloseTo((national.laborCost as number) * 1.20, 0);
    expect(northeast.totalLow as number).toBeGreaterThan(national.totalLow as number);
  });

  // ─── Test 16: West Coast regional multiplier (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const westCoast = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'west-coast',
    });
    // National labor low: 2000, high: 4000
    // West Coast: 2000×1.25=2500 low, 4000×1.25=5000 high
    expect(westCoast.totalLow).toBeCloseTo(5000 + 2500, 0);
    expect(westCoast.totalHigh).toBeCloseTo(10000 + 5000, 0);
  });

  // ─── Test 17: South regional multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'south',
    });
    // Labor: 2000×0.85=1700 low, 4000×0.85=3400 high
    // Total: 5000+1700=6700 low, 10000+3400=13400 high
    expect(result.totalLow).toBeCloseTo(6700, 0);
    expect(result.totalHigh).toBeCloseTo(13400, 0);
  });

  // ─── Test 18: Midwest regional multiplier (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'midwest',
    });
    // Labor: 2000×0.90=1800 low, 4000×0.90=3600 high
    // Total: 5000+1800=6800 low, 10000+3600=13600 high
    expect(result.totalLow).toBeCloseTo(6800, 0);
    expect(result.totalHigh).toBeCloseTo(13600, 0);
  });

  // ─── Test 19: Mid-Atlantic multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'mid-atlantic',
    });
    // Labor: 2000×1.15=2300 low, 4000×1.15=4600 high
    // Total: 5000+2300=7300 low, 10000+4600=14600 high
    expect(result.totalLow).toBeCloseTo(7300, 0);
    expect(result.totalHigh).toBeCloseTo(14600, 0);
  });

  // ─── Test 20: Mountain West multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'mountain-west',
    });
    // Labor: 2000×0.95=1900 low, 4000×0.95=3800 high
    // Total: 5000+1900=6900 low, 10000+3800=13800 high
    expect(result.totalLow).toBeCloseTo(6900, 0);
    expect(result.totalHigh).toBeCloseTo(13800, 0);
  });

  // ─── Test 21: Full build — xlarge, 20-mil, sump pump, commercial dehumidifier, spray foam, northeast ───
  it('calculates fully loaded premium encapsulation project', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'xlarge-2500sqft',
      vaporBarrier: '20-mil-premium',
      drainage: 'sump-pump',
      dehumidifier: 'commercial-grade',
      insulation: 'spray-foam',
      region: 'northeast',
    });
    // Base 9000–18000, barrier ×1.30 → 11700–23400
    // Labor on raw base: 9000×0.4×1.20=4320 low, 18000×0.4×1.20=8640 high
    // Drainage: 1200–2500
    // Dehumidifier: 1500–3000
    // Insulation: 1500–3000
    // Total low: 11700+4320+1200+1500+1500 = 20220
    // Total high: 23400+8640+2500+3000+3000 = 40540
    expect(result.totalLow).toBeCloseTo(20220, 0);
    expect(result.totalHigh).toBeCloseTo(40540, 0);
    expect(result.totalMid).toBeCloseTo((20220 + 40540) / 2, 0);
  });

  // ─── Test 22: Size comparison returns all 5 sizes ───
  it('returns size comparison with all 5 crawl space sizes', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const comparison = result.sizeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Larger sizes should be more expensive
    const small = comparison[0];
    const xlarge = comparison[4];
    expect(xlarge.value).toBeGreaterThan(small.value);
  });

  // ─── Test 23: Timeline output ───
  it('returns correct timeline', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    expect(result.timeline).toBe('2-5 days');
  });

  // ─── Test 24: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('baseCost');
    expect(result).toHaveProperty('barrierCost');
    expect(result).toHaveProperty('drainageCost');
    expect(result).toHaveProperty('dehumidifierCost');
    expect(result).toHaveProperty('insulationCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('sizeComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 25: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateCrawlSpaceEncapsulationCost({});
    // Defaults: standard-1500sqft, 6-mil-standard, none, none, none, national
    // Total: 7000–14000
    expect(result.totalLow).toBeCloseTo(7000, 0);
    expect(result.totalHigh).toBeCloseTo(14000, 0);
    expect(result.totalMid).toBeCloseTo(10500, 0);
  });

  // ─── Test 26: All add-ons stack correctly ───
  it('stacks all add-ons (drain + dehumidifier + insulation) correctly', () => {
    const base = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'none',
      dehumidifier: 'none',
      insulation: 'none',
      region: 'national',
    });
    const full = calculateCrawlSpaceEncapsulationCost({
      crawlSpaceSize: 'standard-1500sqft',
      vaporBarrier: '6-mil-standard',
      drainage: 'interior-drain',
      dehumidifier: 'portable',
      insulation: 'fiberglass-batt',
      region: 'national',
    });
    // Drain: 800–1500, Dehumidifier: 300–600, Insulation: 500–1000
    expect(full.totalLow as number).toBeCloseTo((base.totalLow as number) + 800 + 300 + 500, 0);
    expect(full.totalHigh as number).toBeCloseTo((base.totalHigh as number) + 1500 + 600 + 1000, 0);
  });
});
