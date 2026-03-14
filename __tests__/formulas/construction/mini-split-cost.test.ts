import { calculateMiniSplitCost } from '@/lib/formulas/construction/mini-split-cost';

describe('calculateMiniSplitCost', () => {
  // --- Test 1: Single-zone 12K, standard efficiency, standard line set, no electrical, national ---
  it('calculates a standard single-zone 12K BTU mini-split at national avg', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment: $2,000–$3,500, effMult=1.0
    // Labor: equip × 0.40 × lineSet(1.0) × region(1.0)
    //   laborLow = 2000 × 0.40 = 800
    //   laborHigh = 3500 × 0.40 = 1400
    // Electrical: $0
    // TotalLow: 2000 + 800 + 0 = 2800
    // TotalHigh: 3500 + 1400 + 0 = 4900
    // TotalMid: (2800 + 4900) / 2 = 3850
    expect(result.totalLow).toBe(2800);
    expect(result.totalHigh).toBe(4900);
    expect(result.totalMid).toBe(3850);
    expect(result.equipmentCost).toBe(2750); // (2000+3500)/2
    expect(result.laborCost).toBe(1100); // (800+1400)/2
    expect(result.electricalCost).toBe(0);
    expect(result.costPerZone).toBe(3850); // 1 zone
    expect(result.timeline).toBe('4-8 hours (1 day)');
  });

  // --- Test 2: Single-zone 9K BTU ---
  it('calculates single-zone 9K BTU mini-split', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-9k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment: $1,500–$2,500
    // Labor: 1500×0.40=600 low, 2500×0.40=1000 high
    // TotalLow: 1500 + 600 = 2100
    // TotalHigh: 2500 + 1000 = 3500
    // TotalMid: (2100 + 3500) / 2 = 2800
    expect(result.totalLow).toBe(2100);
    expect(result.totalHigh).toBe(3500);
    expect(result.totalMid).toBe(2800);
    expect(result.timeline).toBe('4-6 hours (1 day)');
  });

  // --- Test 3: Single-zone 18K BTU ---
  it('calculates single-zone 18K BTU mini-split', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-18k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment: $2,500–$4,000
    // Labor: 2500×0.40=1000 low, 4000×0.40=1600 high
    // TotalLow: 2500 + 1000 = 3500
    // TotalHigh: 4000 + 1600 = 5600
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(5600);
    expect(result.totalMid).toBe(4550);
  });

  // --- Test 4: Multi-zone 2-zone ---
  it('calculates multi-zone 2-zone mini-split', () => {
    const result = calculateMiniSplitCost({
      systemType: 'multi-zone-2',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment: $3,500–$6,000
    // Labor: 3500×0.40=1400 low, 6000×0.40=2400 high
    // TotalLow: 3500 + 1400 = 4900
    // TotalHigh: 6000 + 2400 = 8400
    // TotalMid: (4900 + 8400) / 2 = 6650
    expect(result.totalLow).toBe(4900);
    expect(result.totalHigh).toBe(8400);
    expect(result.totalMid).toBe(6650);
    // costPerZone: 6650 / 2 = 3325
    expect(result.costPerZone).toBe(3325);
  });

  // --- Test 5: Multi-zone 3-zone ---
  it('calculates multi-zone 3-zone mini-split', () => {
    const result = calculateMiniSplitCost({
      systemType: 'multi-zone-3',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment: $5,000–$8,000
    // Labor: 5000×0.40=2000 low, 8000×0.40=3200 high
    // TotalLow: 5000 + 2000 = 7000
    // TotalHigh: 8000 + 3200 = 11200
    // TotalMid: (7000 + 11200) / 2 = 9100
    expect(result.totalLow).toBe(7000);
    expect(result.totalHigh).toBe(11200);
    expect(result.totalMid).toBe(9100);
    // costPerZone: 9100 / 3 = 3033.33
    expect(result.costPerZone).toBeCloseTo(3033.33, 1);
    expect(result.timeline).toBe('2-3 days');
  });

  // --- Test 6: Multi-zone 4-zone ---
  it('calculates multi-zone 4-zone mini-split', () => {
    const result = calculateMiniSplitCost({
      systemType: 'multi-zone-4',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment: $6,500–$10,000
    // Labor: 6500×0.40=2600 low, 10000×0.40=4000 high
    // TotalLow: 6500 + 2600 = 9100
    // TotalHigh: 10000 + 4000 = 14000
    // TotalMid: (9100 + 14000) / 2 = 11550
    expect(result.totalLow).toBe(9100);
    expect(result.totalHigh).toBe(14000);
    expect(result.totalMid).toBe(11550);
    // costPerZone: 11550 / 4 = 2887.50
    expect(result.costPerZone).toBe(2887.5);
  });

  // --- Test 7: High efficiency (22 SEER2) multiplier ---
  it('applies high efficiency 22 SEER2 multiplier (1.15x)', () => {
    const standard = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const high = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'high-22-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment increases by 15%
    // equipmentLow: 2000 × 1.15 = 2300
    // equipmentHigh: 3500 × 1.15 = 4025
    expect(high.totalLow).toBe(parseFloat((2300 + 2300 * 0.40).toFixed(2))); // 2300 + 920 = 3220
    expect(high.totalHigh).toBe(parseFloat((4025 + 4025 * 0.40).toFixed(2))); // 4025 + 1610 = 5635
    expect((high.equipmentCost as number)).toBeGreaterThan((standard.equipmentCost as number));
    expect((high.laborCost as number)).toBeGreaterThan((standard.laborCost as number));
  });

  // --- Test 8: Premium efficiency (25 SEER2) multiplier ---
  it('applies premium efficiency 25 SEER2 multiplier (1.30x)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'premium-25-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // equipmentLow: 2000 × 1.30 = 2600
    // equipmentHigh: 3500 × 1.30 = 4550
    // laborLow: 2600 × 0.40 = 1040
    // laborHigh: 4550 × 0.40 = 1820
    // totalLow: 2600 + 1040 = 3640
    // totalHigh: 4550 + 1820 = 6370
    expect(result.totalLow).toBe(3640);
    expect(result.totalHigh).toBe(6370);
    expect(result.totalMid).toBe(5005);
  });

  // --- Test 9: Extended line set (25ft) multiplier ---
  it('applies extended 25ft line set multiplier (1.10x to labor)', () => {
    const standard = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const extended = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'extended-25ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment stays the same
    expect(extended.equipmentCost).toBe(standard.equipmentCost);
    // Labor increases by 10%
    expect((extended.laborCost as number)).toBeCloseTo((standard.laborCost as number) * 1.10, 1);
    // laborLow: 2000×0.40×1.10 = 880
    // laborHigh: 3500×0.40×1.10 = 1540
    // totalLow: 2000 + 880 = 2880
    // totalHigh: 3500 + 1540 = 5040
    expect(extended.totalLow).toBe(2880);
    expect(extended.totalHigh).toBe(5040);
  });

  // --- Test 10: Long-run line set (50ft) multiplier ---
  it('applies long-run 50ft line set multiplier (1.25x to labor)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'long-run-50ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // laborLow: 2000×0.40×1.25 = 1000
    // laborHigh: 3500×0.40×1.25 = 1750
    // totalLow: 2000 + 1000 = 3000
    // totalHigh: 3500 + 1750 = 5250
    expect(result.totalLow).toBe(3000);
    expect(result.totalHigh).toBe(5250);
    expect(result.totalMid).toBe(4125);
  });

  // --- Test 11: New circuit electrical work ---
  it('adds new circuit electrical cost ($300-$600)', () => {
    const noElec = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const newCircuit = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'new-circuit',
      region: 'national',
    });
    expect(newCircuit.electricalCost).toBe(450); // (300+600)/2
    expect((newCircuit.totalLow as number)).toBe((noElec.totalLow as number) + 300);
    expect((newCircuit.totalHigh as number)).toBe((noElec.totalHigh as number) + 600);
  });

  // --- Test 12: Sub-panel required electrical work ---
  it('adds sub-panel electrical cost ($800-$1500)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'sub-panel-required',
      region: 'national',
    });
    expect(result.electricalCost).toBe(1150); // (800+1500)/2
    // totalLow: 2000 + 800 + 800 = 3600
    // totalHigh: 3500 + 1400 + 1500 = 6400
    expect(result.totalLow).toBe(3600);
    expect(result.totalHigh).toBe(6400);
  });

  // --- Test 13: Northeast region multiplier (1.20x) ---
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const northeast = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'northeast',
    });
    // Equipment stays same
    expect(northeast.equipmentCost).toBe(national.equipmentCost);
    // Labor increases by 20%
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    // laborLow: 2000×0.40×1.20 = 960
    // laborHigh: 3500×0.40×1.20 = 1680
    // totalLow: 2000 + 960 = 2960
    // totalHigh: 3500 + 1680 = 5180
    expect(northeast.totalLow).toBe(2960);
    expect(northeast.totalHigh).toBe(5180);
  });

  // --- Test 14: West Coast region multiplier (1.25x, most expensive) ---
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'west-coast',
    });
    // laborLow: 2000×0.40×1.25 = 1000
    // laborHigh: 3500×0.40×1.25 = 1750
    // totalLow: 2000 + 1000 = 3000
    // totalHigh: 3500 + 1750 = 5250
    expect(result.totalLow).toBe(3000);
    expect(result.totalHigh).toBe(5250);
  });

  // --- Test 15: South region multiplier (0.85x, cheapest labor) ---
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const south = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    // laborLow: 2000×0.40×0.85 = 680
    // laborHigh: 3500×0.40×0.85 = 1190
    // totalLow: 2000 + 680 = 2680
    // totalHigh: 3500 + 1190 = 4690
    expect(south.totalLow).toBe(2680);
    expect(south.totalHigh).toBe(4690);
  });

  // --- Test 16: Midwest region multiplier (0.90x) ---
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'midwest',
    });
    // laborLow: 2000×0.40×0.90 = 720
    // laborHigh: 3500×0.40×0.90 = 1260
    // laborMid: (720+1260)/2 = 990
    expect(result.laborCost).toBe(990);
    expect(result.totalLow).toBe(2720);
    expect(result.totalHigh).toBe(4760);
  });

  // --- Test 17: Mid-Atlantic region multiplier (1.15x) ---
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'mid-atlantic',
    });
    // laborLow: 2000×0.40×1.15 = 920
    // laborHigh: 3500×0.40×1.15 = 1610
    expect(result.totalLow).toBe(2920);
    expect(result.totalHigh).toBe(5110);
  });

  // --- Test 18: Mountain West region multiplier (0.95x) ---
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'mountain-west',
    });
    // laborLow: 2000×0.40×0.95 = 760
    // laborHigh: 3500×0.40×0.95 = 1330
    expect(result.totalLow).toBe(2760);
    expect(result.totalHigh).toBe(4830);
  });

  // --- Test 19: Combo — high efficiency + extended line set + new circuit + northeast ---
  it('correctly combines all multipliers and add-ons', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'high-22-seer2',
      lineSetLength: 'extended-25ft',
      electricalWork: 'new-circuit',
      region: 'northeast',
    });
    // equipmentLow: 2000 × 1.15 = 2300
    // equipmentHigh: 3500 × 1.15 = 4025
    // laborLow: 2300 × 0.40 × 1.10 × 1.20 = 2300 × 0.528 = 1214.40
    // laborHigh: 4025 × 0.40 × 1.10 × 1.20 = 4025 × 0.528 = 2125.20
    // electricalLow: 300, electricalHigh: 600
    // totalLow: 2300 + 1214.40 + 300 = 3814.40
    // totalHigh: 4025 + 2125.20 + 600 = 6750.20
    expect(result.totalLow).toBe(3814.4);
    expect(result.totalHigh).toBe(6750.2);
    expect(result.electricalCost).toBe(450);
  });

  // --- Test 20: Combo — premium efficiency + long run + sub-panel + west coast ---
  it('calculates premium setup with all add-ons on west coast', () => {
    const result = calculateMiniSplitCost({
      systemType: 'multi-zone-3',
      efficiency: 'premium-25-seer2',
      lineSetLength: 'long-run-50ft',
      electricalWork: 'sub-panel-required',
      region: 'west-coast',
    });
    // equipmentLow: 5000 × 1.30 = 6500
    // equipmentHigh: 8000 × 1.30 = 10400
    // laborLow: 6500 × 0.40 × 1.25 × 1.25 = 6500 × 0.625 = 4062.50
    // laborHigh: 10400 × 0.40 × 1.25 × 1.25 = 10400 × 0.625 = 6500
    // electricalLow: 800, electricalHigh: 1500
    // totalLow: 6500 + 4062.50 + 800 = 11362.50
    // totalHigh: 10400 + 6500 + 1500 = 18400
    expect(result.totalLow).toBe(11362.5);
    expect(result.totalHigh).toBe(18400);
    expect(result.costPerZone).toBeCloseTo(((11362.5 + 18400) / 2) / 3, 1);
  });

  // --- Test 21: System comparison has all 6 system types ---
  it('returns system comparison with all 6 types', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const comparison = result.systemComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(6);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // 9K should be cheapest, 4-zone most expensive
    const nineK = comparison.find(c => c.label.includes('9K'))!;
    const fourZone = comparison.find(c => c.label.includes('4-Zone'))!;
    expect(nineK.value).toBeLessThan(fourZone.value);
  });

  // --- Test 22: Output structure has all expected fields ---
  it('returns all expected output fields', () => {
    const result = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    expect(result).toHaveProperty('equipmentCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('electricalCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerZone');
    expect(result).toHaveProperty('systemComparison');
    expect(result).toHaveProperty('timeline');
  });

  // --- Test 23: Default inputs produce valid output ---
  it('uses default inputs when values are missing', () => {
    const result = calculateMiniSplitCost({});
    // Defaults to single-zone-12k, standard efficiency, standard line set, existing circuit, national
    expect(result.totalLow).toBe(2800);
    expect(result.totalHigh).toBe(4900);
    expect(result.totalMid).toBe(3850);
  });

  // --- Test 24: Regional multiplier only affects labor, not equipment or electrical ---
  it('regional multiplier changes labor but not equipment or electrical', () => {
    const national = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'new-circuit',
      region: 'national',
    });
    const northeast = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'new-circuit',
      region: 'northeast',
    });
    expect(national.equipmentCost).toBe(northeast.equipmentCost);
    expect(national.electricalCost).toBe(northeast.electricalCost);
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
  });

  // --- Test 25: Efficiency multiplier affects both equipment AND labor ---
  it('efficiency multiplier affects both equipment and labor proportionally', () => {
    const standard = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const premium = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'premium-25-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Equipment increases by 30%
    expect((premium.equipmentCost as number)).toBeCloseTo((standard.equipmentCost as number) * 1.30, 0);
    // Labor also increases because it's 40% of equipment
    expect((premium.laborCost as number)).toBeCloseTo((standard.laborCost as number) * 1.30, 0);
  });

  // --- Test 26: Unknown system type defaults to single-zone-12k ---
  it('defaults to single-zone-12k for unknown system type', () => {
    const unknown = calculateMiniSplitCost({
      systemType: 'unknown-system',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const default12k = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    expect(unknown.totalMid).toBe(default12k.totalMid);
  });

  // --- Test 27: Cost ordering across all system types ---
  it('9K < 12K < 18K < 2-zone < 3-zone < 4-zone in total cost', () => {
    const types = ['single-zone-9k', 'single-zone-12k', 'single-zone-18k', 'multi-zone-2', 'multi-zone-3', 'multi-zone-4'];
    const costs = types.map(t => {
      const r = calculateMiniSplitCost({
        systemType: t,
        efficiency: 'standard-20-seer2',
        lineSetLength: 'standard-15ft',
        electricalWork: 'existing-circuit',
        region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    for (let i = 1; i < costs.length; i++) {
      expect(costs[i].mid).toBeGreaterThan(costs[i - 1].mid);
    }
  });

  // --- Test 28: Cost per zone decreases with more zones ---
  it('cost per zone is lower for multi-zone systems', () => {
    const singleZone = calculateMiniSplitCost({
      systemType: 'single-zone-12k',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    const fourZone = calculateMiniSplitCost({
      systemType: 'multi-zone-4',
      efficiency: 'standard-20-seer2',
      lineSetLength: 'standard-15ft',
      electricalWork: 'existing-circuit',
      region: 'national',
    });
    // Single zone: $3850/zone, 4-zone: $11550/4 = $2887.50/zone
    expect((fourZone.costPerZone as number)).toBeLessThan((singleZone.costPerZone as number));
  });
});
