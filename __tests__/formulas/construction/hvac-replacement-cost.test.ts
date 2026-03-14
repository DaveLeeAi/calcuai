import { calculateHvacReplacementCost } from '@/lib/formulas/construction/hvac-replacement-cost';

describe('calculateHvacReplacementCost', () => {
  // ─── Test 1: Standard central AC, medium home, national, no extras ───
  it('calculates central AC for a medium home at national average', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $3000 × 1.25 × 1.0 = $3750 low, $6000 × 1.25 × 1.0 = $7500 high
    // Labor: $3750 × 0.40 × 1.0 = $1500 low, $7500 × 0.40 × 1.0 = $3000 high
    // Ductwork: $0, Thermostat: $0
    // TotalLow: 3750 + 1500 + 0 + 0 = $5250
    // TotalHigh: 7500 + 3000 + 0 + 0 = $10500
    // TotalMid: (5250 + 10500) / 2 = $7875
    expect(result.totalLow).toBe(5250);
    expect(result.totalHigh).toBe(10500);
    expect(result.totalMid).toBe(7875);
    expect(result.equipmentCost).toBe(5625); // (3750 + 7500) / 2
    expect(result.laborCost).toBe(2250); // (1500 + 3000) / 2
    expect(result.ductworkCost).toBe(0);
    expect(result.thermostatCost).toBe(0);
  });

  // ─── Test 2: Furnace only, small home, national ───
  it('calculates furnace only for a small home', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'furnace-only',
      homeSize: 'small-under-1500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $2500 × 1.0 × 1.0 = $2500 low, $5000 × 1.0 × 1.0 = $5000 high
    // Labor: $2500 × 0.40 = $1000 low, $5000 × 0.40 = $2000 high
    // TotalLow: 2500 + 1000 = $3500
    // TotalHigh: 5000 + 2000 = $7000
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(7000);
    expect(result.totalMid).toBe(5250);
  });

  // ─── Test 3: AC + Furnace bundle, large home ───
  it('calculates AC + furnace bundle for a large home', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'ac-and-furnace',
      homeSize: 'large-2500-3500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $5000 × 1.50 = $7500 low, $10000 × 1.50 = $15000 high
    // Labor: $7500 × 0.40 = $3000 low, $15000 × 0.40 = $6000 high
    // TotalLow: 7500 + 3000 = $10500
    // TotalHigh: 15000 + 6000 = $21000
    expect(result.totalLow).toBe(10500);
    expect(result.totalHigh).toBe(21000);
    expect(result.totalMid).toBe(15750);
  });

  // ─── Test 4: Heat pump, xlarge home ───
  it('calculates heat pump for an xlarge home', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'heat-pump',
      homeSize: 'xlarge-over-3500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $4000 × 1.80 = $7200 low, $8000 × 1.80 = $14400 high
    // Labor: $7200 × 0.40 = $2880 low, $14400 × 0.40 = $5760 high
    // TotalLow: 7200 + 2880 = $10080
    // TotalHigh: 14400 + 5760 = $20160
    expect(result.totalLow).toBe(10080);
    expect(result.totalHigh).toBe(20160);
    expect(result.totalMid).toBe(15120);
  });

  // ─── Test 5: Ductless mini-split, small home ───
  it('calculates ductless mini-split for a small home', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'ductless-mini-split',
      homeSize: 'small-under-1500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $3000 × 1.0 = $3000 low, $5000 × 1.0 = $5000 high
    // Labor: $3000 × 0.40 = $1200 low, $5000 × 0.40 = $2000 high
    // TotalLow: 3000 + 1200 = $4200
    // TotalHigh: 5000 + 2000 = $7000
    expect(result.totalLow).toBe(4200);
    expect(result.totalHigh).toBe(7000);
    expect(result.totalMid).toBe(5600);
  });

  // ─── Test 6: High efficiency (16 SEER) multiplier ───
  it('applies high efficiency multiplier (1.15x)', () => {
    const standard = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const high = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'high-16-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment increases by 15%
    expect((high.equipmentCost as number)).toBeCloseTo((standard.equipmentCost as number) * 1.15, 1);
    expect((high.totalMid as number)).toBeGreaterThan((standard.totalMid as number));
  });

  // ─── Test 7: Premium efficiency (20 SEER) multiplier ───
  it('applies premium efficiency multiplier (1.35x)', () => {
    const standard = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const premium = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'premium-20-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $3000 × 1.25 × 1.35 = $5062.50 low, $6000 × 1.25 × 1.35 = $10125 high
    expect(premium.totalLow).toBe(7087.5);
    expect(premium.totalHigh).toBe(14175);
  });

  // ─── Test 8: Minor ductwork repair adds cost ───
  it('adds minor ductwork repair cost ($500–$1500)', () => {
    const noRepair = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const minorRepair = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'minor-repair',
      thermostat: 'none',
      region: 'national',
    });
    expect(minorRepair.ductworkCost).toBe(1000); // (500 + 1500) / 2
    expect((minorRepair.totalLow as number)).toBe((noRepair.totalLow as number) + 500);
    expect((minorRepair.totalHigh as number)).toBe((noRepair.totalHigh as number) + 1500);
  });

  // ─── Test 9: Major ductwork repair ───
  it('adds major ductwork repair cost ($2000–$5000)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'major-repair',
      thermostat: 'none',
      region: 'national',
    });
    expect(result.ductworkCost).toBe(3500); // (2000 + 5000) / 2
    // TotalLow: 5250 + 2000 = $7250
    // TotalHigh: 10500 + 5000 = $15500
    expect(result.totalLow).toBe(7250);
    expect(result.totalHigh).toBe(15500);
  });

  // ─── Test 10: New ductwork ───
  it('adds new ductwork cost ($5000–$12000)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'new-ductwork',
      thermostat: 'none',
      region: 'national',
    });
    expect(result.ductworkCost).toBe(8500); // (5000 + 12000) / 2
    expect(result.totalLow).toBe(10250); // 5250 + 5000
    expect(result.totalHigh).toBe(22500); // 10500 + 12000
  });

  // ─── Test 11: Smart thermostat upgrade ───
  it('adds smart WiFi thermostat cost ($200–$400)', () => {
    const noThermo = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const smartThermo = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'smart-wifi',
      region: 'national',
    });
    expect(smartThermo.thermostatCost).toBe(300); // (200 + 400) / 2
    expect((smartThermo.totalLow as number)).toBe((noThermo.totalLow as number) + 200);
    expect((smartThermo.totalHigh as number)).toBe((noThermo.totalHigh as number) + 400);
  });

  // ─── Test 12: Basic programmable thermostat ───
  it('adds basic programmable thermostat cost ($150–$300)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'basic-programmable',
      region: 'national',
    });
    expect(result.thermostatCost).toBe(225); // (150 + 300) / 2
    expect(result.totalLow).toBe(5400); // 5250 + 150
    expect(result.totalHigh).toBe(10800); // 10500 + 300
  });

  // ─── Test 13: Northeast region multiplier (1.20x) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const northeast = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'northeast',
    });
    // Labor increases by 20%, equipment stays same
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    expect(northeast.equipmentCost).toBe(national.equipmentCost);
    expect((northeast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 14: South region multiplier (0.85x) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const south = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
    // Exact: labor national = 2250, south = 2250 × 0.85 = 1912.50
    expect((south.laborCost as number)).toBeCloseTo(1912.5, 1);
  });

  // ─── Test 15: West Coast region multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'west-coast',
    });
    // Labor low: 3750 × 0.40 × 1.25 = 1875, high: 7500 × 0.40 × 1.25 = 3750
    // Labor mid: (1875 + 3750) / 2 = 2812.50
    expect((result.laborCost as number)).toBeCloseTo(2812.5, 1);
    // TotalLow: 3750 + 1875 = 5625
    expect(result.totalLow).toBe(5625);
  });

  // ─── Test 16: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'midwest',
    });
    // Labor low: 3750 × 0.40 × 0.90 = 1350, high: 7500 × 0.40 × 0.90 = 2700
    expect(result.totalLow).toBe(5100); // 3750 + 1350
    expect(result.totalHigh).toBe(10200); // 7500 + 2700
  });

  // ─── Test 17: Cost per ton calculation ───
  it('calculates cost per ton correctly', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // totalMid = 7875, tonnage for medium = 3.0
    // costPerTon = 7875 / 3.0 = 2625
    expect(result.costPerTon).toBe(2625);
  });

  // ─── Test 18: Cost per ton for small home (2 ton) ───
  it('calculates cost per ton for small home (2 ton)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'small-under-1500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $3000 low, $6000 high, Labor: $1200 low, $2400 high
    // TotalMid = (4200 + 8400) / 2 = 6300
    // costPerTon = 6300 / 2.0 = 3150
    expect(result.costPerTon).toBe(3150);
  });

  // ─── Test 19: System comparison returns all 5 types ───
  it('returns system comparison with all 5 types', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const comparison = result.systemComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
  });

  // ─── Test 20: AC + Furnace is most expensive system ───
  it('AC + furnace bundle is the most expensive system type', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'ac-and-furnace',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const comparison = result.systemComparison as Array<{ label: string; value: number }>;
    const acFurnace = comparison.find(c => c.label.includes('AC + Furnace'));
    const furnaceOnly = comparison.find(c => c.label.includes('Furnace Only'));
    expect(acFurnace!.value).toBeGreaterThan(furnaceOnly!.value);
  });

  // ─── Test 21: Estimated annual savings messages ───
  it('returns correct savings message for each efficiency tier', () => {
    const standard = calculateHvacReplacementCost({
      systemType: 'central-ac-only', homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer', ductwork: 'existing-good',
      thermostat: 'none', region: 'national',
    });
    const high = calculateHvacReplacementCost({
      systemType: 'central-ac-only', homeSize: 'medium-1500-2500',
      efficiency: 'high-16-seer', ductwork: 'existing-good',
      thermostat: 'none', region: 'national',
    });
    const premium = calculateHvacReplacementCost({
      systemType: 'central-ac-only', homeSize: 'medium-1500-2500',
      efficiency: 'premium-20-seer', ductwork: 'existing-good',
      thermostat: 'none', region: 'national',
    });
    expect(standard.estimatedAnnualSavings).toContain('Baseline');
    expect(high.estimatedAnnualSavings).toContain('$100');
    expect(premium.estimatedAnnualSavings).toContain('$300');
  });

  // ─── Test 22: Timeline by system type ───
  it('returns correct timeline for each system type', () => {
    const acOnly = calculateHvacReplacementCost({
      systemType: 'central-ac-only', homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer', ductwork: 'existing-good',
      thermostat: 'none', region: 'national',
    });
    const bundle = calculateHvacReplacementCost({
      systemType: 'ac-and-furnace', homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer', ductwork: 'existing-good',
      thermostat: 'none', region: 'national',
    });
    expect(acOnly.timeline).toBe('1–2 days');
    expect(bundle.timeline).toBe('2–3 days');
  });

  // ─── Test 23: Output structure includes all fields ───
  it('returns all expected output fields', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('equipmentCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('ductworkCost');
    expect(result).toHaveProperty('thermostatCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerTon');
    expect(result).toHaveProperty('systemComparison');
    expect(result).toHaveProperty('estimatedAnnualSavings');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 24: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateHvacReplacementCost({});
    // Defaults: central-ac-only, medium-1500-2500, standard, existing-good, none, national
    expect((result.totalMid as number)).toBeGreaterThan(0);
    expect(result.equipmentCost).toBe(5625);
  });

  // ─── Test 25: Regional multiplier only affects labor, not equipment ───
  it('regional multiplier changes labor but not equipment cost', () => {
    const national = calculateHvacReplacementCost({
      systemType: 'heat-pump',
      homeSize: 'large-2500-3500',
      efficiency: 'high-16-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    const northeast = calculateHvacReplacementCost({
      systemType: 'heat-pump',
      homeSize: 'large-2500-3500',
      efficiency: 'high-16-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'northeast',
    });
    expect(national.equipmentCost).toBe(northeast.equipmentCost);
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });

  // ─── Test 26: Full combo — premium heat pump, xlarge, new ductwork, smart thermo, west coast ───
  it('calculates a maxed-out full combo correctly', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'heat-pump',
      homeSize: 'xlarge-over-3500',
      efficiency: 'premium-20-seer',
      ductwork: 'new-ductwork',
      thermostat: 'smart-wifi',
      region: 'west-coast',
    });
    // Equipment: $4000 × 1.80 × 1.35 = $9720 low, $8000 × 1.80 × 1.35 = $19440 high
    // Labor: $9720 × 0.40 × 1.25 = $4860 low, $19440 × 0.40 × 1.25 = $9720 high
    // Ductwork: $5000 low, $12000 high
    // Thermostat: $200 low, $400 high
    // TotalLow: 9720 + 4860 + 5000 + 200 = $19780
    // TotalHigh: 19440 + 9720 + 12000 + 400 = $41560
    expect(result.totalLow).toBe(19780);
    expect(result.totalHigh).toBe(41560);
    expect(result.totalMid).toBe(30670);
  });

  // ─── Test 27: Mountain-west region multiplier (0.95x) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'mountain-west',
    });
    // Labor low: 3750 × 0.40 × 0.95 = 1425, high: 7500 × 0.40 × 0.95 = 2850
    expect(result.totalLow).toBe(5175); // 3750 + 1425
    expect(result.totalHigh).toBe(10350); // 7500 + 2850
  });

  // ─── Test 28: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'central-ac-only',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'mid-atlantic',
    });
    // Labor low: 3750 × 0.40 × 1.15 = 1725, high: 7500 × 0.40 × 1.15 = 3450
    expect(result.totalLow).toBe(5475); // 3750 + 1725
    expect(result.totalHigh).toBe(10950); // 7500 + 3450
  });

  // ─── Test 29: Ductwork + thermostat combined additives ───
  it('correctly combines ductwork and thermostat costs', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'furnace-only',
      homeSize: 'small-under-1500',
      efficiency: 'standard-14-seer',
      ductwork: 'minor-repair',
      thermostat: 'smart-wifi',
      region: 'national',
    });
    // Base: totalLow = 3500, totalHigh = 7000
    // + ductwork: +500 low, +1500 high
    // + thermostat: +200 low, +400 high
    // totalLow: 3500 + 500 + 200 = $4200
    // totalHigh: 7000 + 1500 + 400 = $8900
    expect(result.totalLow).toBe(4200);
    expect(result.totalHigh).toBe(8900);
    expect(result.ductworkCost).toBe(1000);
    expect(result.thermostatCost).toBe(300);
  });

  // ─── Test 30: Cost per ton for xlarge home (5 ton) ───
  it('calculates cost per ton for xlarge home (5 ton)', () => {
    const result = calculateHvacReplacementCost({
      systemType: 'ac-and-furnace',
      homeSize: 'xlarge-over-3500',
      efficiency: 'standard-14-seer',
      ductwork: 'existing-good',
      thermostat: 'none',
      region: 'national',
    });
    // Equipment: $5000 × 1.80 = $9000 low, $10000 × 1.80 = $18000 high
    // Labor: $9000 × 0.40 = $3600 low, $18000 × 0.40 = $7200 high
    // TotalMid: (12600 + 25200) / 2 = 18900
    // costPerTon = 18900 / 5.0 = 3780
    expect(result.totalMid).toBe(18900);
    expect(result.costPerTon).toBe(3780);
  });
});
