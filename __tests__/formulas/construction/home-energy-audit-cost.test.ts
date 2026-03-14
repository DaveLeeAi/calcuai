import { calculateHomeEnergyAuditCost } from '../../../lib/formulas/construction/home-energy-audit-cost';

describe('calculateHomeEnergyAuditCost', () => {
  // ─── Test 1: Default inputs — standard home, standard-diagnostic, no add-ons, national ───
  it('calculates default home energy audit at national average', () => {
    const result = calculateHomeEnergyAuditCost({}) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // Default: standard-2500-3500 ($300–$500), standard-diagnostic (1.5x), national (1.0x)
    // baseCostLow: 300×1.5=450, baseCostHigh: 500×1.5=750
    // subtotalLow: 450, subtotalHigh: 750
    // totalLow: 450×1.0=450, totalHigh: 750×1.0=750
    expect(result.totalLow).toBeCloseTo(450, 0);
    expect(result.totalHigh).toBeCloseTo(750, 0);
    expect(result.totalMid).toBeCloseTo(600, 0);
    expect(result.timeline).toBe('2-4 hours');
    expect(result.potentialSavings).toBeTruthy();
  });

  // ─── Test 2: All required output fields present ───
  it('returns all expected output fields', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    });
    expect(result).toHaveProperty('baseCost');
    expect(result).toHaveProperty('thermalCost');
    expect(result).toHaveProperty('ductTestCost');
    expect(result).toHaveProperty('combustionCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('auditLevelComparison');
    expect(result).toHaveProperty('potentialSavings');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 3: Small home, visual walkthrough ───
  it('calculates small home visual walkthrough correctly', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'small-under-1500',
      auditLevel: 'visual-walkthrough',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // baseCostLow: 150×1.0=150, baseCostHigh: 300×1.0=300
    // total: 150–300
    expect(result.totalLow).toBeCloseTo(150, 0);
    expect(result.totalHigh).toBeCloseTo(300, 0);
    expect(result.totalMid).toBeCloseTo(225, 0);
  });

  // ─── Test 4: Extra-large home, comprehensive audit ───
  it('calculates xlarge home comprehensive audit correctly', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'xlarge-over-5000',
      auditLevel: 'comprehensive-with-blower',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // baseCostLow: 500×2.0=1000, baseCostHigh: 1000×2.0=2000
    expect(result.totalLow).toBeCloseTo(1000, 0);
    expect(result.totalHigh).toBeCloseTo(2000, 0);
    expect(result.totalMid).toBeCloseTo(1500, 0);
  });

  // ─── Test 5: Full performance testing multiplier (2.75x) ───
  it('applies full-performance-testing multiplier (2.75x)', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'medium-1500-2500',
      auditLevel: 'full-performance-testing',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number | string | Array<{ label: string; value: number }>>;
    // baseCostLow: 200×2.75=550, baseCostHigh: 400×2.75=1100
    expect(result.totalLow).toBeCloseTo(550, 0);
    expect(result.totalHigh).toBeCloseTo(1100, 0);
  });

  // ─── Test 6: Thermal imaging basic-scan add-on (+$100–$200) ───
  it('adds basic thermal scan cost correctly', () => {
    const none = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    const thermal = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'basic-scan',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(thermal.thermalCost).toBeCloseTo(150, 0); // (100+200)/2
    expect(thermal.totalLow).toBeCloseTo(none.totalLow + 100, 0);
    expect(thermal.totalHigh).toBeCloseTo(none.totalHigh + 200, 0);
  });

  // ─── Test 7: Detailed thermal report (+$200–$400) ───
  it('adds detailed thermal report cost correctly', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'detailed-report',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(result.thermalCost).toBeCloseTo(300, 0); // (200+400)/2
    expect(result.totalLow).toBeCloseTo(450 + 200, 0);
    expect(result.totalHigh).toBeCloseTo(750 + 400, 0);
  });

  // ─── Test 8: Duct pressure test add-on (+$100–$250) ───
  it('adds duct pressure test cost correctly', () => {
    const none = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    const duct = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'pressure-test',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(duct.ductTestCost).toBeCloseTo(175, 0); // (100+250)/2
    expect(duct.totalLow).toBeCloseTo(none.totalLow + 100, 0);
    expect(duct.totalHigh).toBeCloseTo(none.totalHigh + 250, 0);
  });

  // ─── Test 9: Full duct leakage test (+$200–$450) ───
  it('adds full duct leakage test cost correctly', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'full-duct-leakage',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    expect(result.ductTestCost).toBeCloseTo(325, 0); // (200+450)/2
    expect(result.totalLow).toBeCloseTo(450 + 200, 0);
    expect(result.totalHigh).toBeCloseTo(750 + 450, 0);
  });

  // ─── Test 10: Combustion basic test (+$50–$100) ───
  it('adds basic combustion safety test cost correctly', () => {
    const none = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    const combustion = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'basic',
      region: 'national',
    }) as Record<string, number>;
    expect(combustion.combustionCost).toBeCloseTo(75, 0); // (50+100)/2
    expect(combustion.totalLow).toBeCloseTo(none.totalLow + 50, 0);
    expect(combustion.totalHigh).toBeCloseTo(none.totalHigh + 100, 0);
  });

  // ─── Test 11: Comprehensive combustion test (+$100–$250) ───
  it('adds comprehensive combustion test cost correctly', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'comprehensive',
      region: 'national',
    }) as Record<string, number>;
    expect(result.combustionCost).toBeCloseTo(175, 0); // (100+250)/2
    expect(result.totalLow).toBeCloseTo(450 + 100, 0);
    expect(result.totalHigh).toBeCloseTo(750 + 250, 0);
  });

  // ─── Test 12: Northeast region multiplier (1.20x full cost) ───
  it('applies northeast regional multiplier (1.20x to full cost)', () => {
    const national = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    const northeast = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'northeast',
    }) as Record<string, number>;
    expect(northeast.totalLow).toBeCloseTo(national.totalLow * 1.20, 0);
    expect(northeast.totalHigh).toBeCloseTo(national.totalHigh * 1.20, 0);
  });

  // ─── Test 13: West Coast region multiplier (1.25x) ───
  it('applies west coast regional multiplier (1.25x)', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'west-coast',
    }) as Record<string, number>;
    // baseLow: 450, total: 450×1.25=562.5
    expect(result.totalLow).toBeCloseTo(562.5, 0);
    expect(result.totalHigh).toBeCloseTo(937.5, 0);
  });

  // ─── Test 14: South region multiplier (0.85x) ───
  it('applies south regional multiplier (0.85x)', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'south',
    }) as Record<string, number>;
    // baseLow: 450×0.85=382.5
    expect(result.totalLow).toBeCloseTo(382.5, 0);
    expect(result.totalHigh).toBeCloseTo(637.5, 0);
  });

  // ─── Test 15: Midwest region multiplier (0.90x) ───
  it('applies midwest regional multiplier (0.90x)', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'midwest',
    }) as Record<string, number>;
    expect(result.totalLow).toBeCloseTo(405, 0); // 450×0.90
    expect(result.totalHigh).toBeCloseTo(675, 0); // 750×0.90
  });

  // ─── Test 16: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional multiplier (1.15x)', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'mid-atlantic',
    }) as Record<string, number>;
    expect(result.totalLow).toBeCloseTo(517.5, 0); // 450×1.15
    expect(result.totalHigh).toBeCloseTo(862.5, 0); // 750×1.15
  });

  // ─── Test 17: Mountain West region multiplier (0.95x) ───
  it('applies mountain-west regional multiplier (0.95x)', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'mountain-west',
    }) as Record<string, number>;
    expect(result.totalLow).toBeCloseTo(427.5, 0); // 450×0.95
    expect(result.totalHigh).toBeCloseTo(712.5, 0); // 750×0.95
  });

  // ─── Test 18: Audit level comparison array ───
  it('returns auditLevelComparison with all 4 audit levels', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    });
    const comparison = result.auditLevelComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Visual walkthrough should be cheapest, full performance testing most expensive
    const visual = comparison.find(c => c.label.includes('Visual'));
    const full = comparison.find(c => c.label.includes('Full Performance'));
    expect(visual!.value).toBeLessThan(full!.value);
  });

  // ─── Test 19: All add-ons stack correctly ───
  it('stacks all add-ons correctly against subtotal', () => {
    const none = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'none',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    const all = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'basic-scan',
      ductTesting: 'pressure-test',
      combustionSafety: 'basic',
      region: 'national',
    }) as Record<string, number>;
    // Add-ons: thermal basic (+100–200) + duct pressure (+100–250) + combustion basic (+50–100)
    // subtotalLow: 450 + 100 + 100 + 50 = 700
    // subtotalHigh: 750 + 200 + 250 + 100 = 1300
    expect(all.subtotalLow).toBeCloseTo(700, 0);
    expect(all.subtotalHigh).toBeCloseTo(1300, 0);
  });

  // ─── Test 20: totalMid = (totalLow + totalHigh) / 2 ───
  it('totalMid equals average of totalLow and totalHigh', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'large-3500-5000',
      auditLevel: 'comprehensive-with-blower',
      thermalImaging: 'detailed-report',
      ductTesting: 'full-duct-leakage',
      combustionSafety: 'comprehensive',
      region: 'northeast',
    }) as Record<string, number>;
    expect(result.totalMid).toBeCloseTo((result.totalLow + result.totalHigh) / 2, 0);
  });

  // ─── Test 21: Regional multiplier applies to full cost (not just labor) ───
  it('applies regional multiplier to full cost including add-ons', () => {
    const national = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'basic-scan',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'national',
    }) as Record<string, number>;
    const northeast = calculateHomeEnergyAuditCost({
      homeSize: 'standard-2500-3500',
      auditLevel: 'standard-diagnostic',
      thermalImaging: 'basic-scan',
      ductTesting: 'none',
      combustionSafety: 'none',
      region: 'northeast',
    }) as Record<string, number>;
    // Northeast applies 1.20x to full subtotal (base + add-ons)
    expect(northeast.totalLow).toBeCloseTo(national.subtotalLow * 1.20, 0);
    expect(northeast.totalHigh).toBeCloseTo(national.subtotalHigh * 1.20, 0);
  });

  // ─── Test 22: Large home, full performance testing, all add-ons, west-coast ───
  it('calculates fully loaded premium energy audit correctly', () => {
    const result = calculateHomeEnergyAuditCost({
      homeSize: 'large-3500-5000',
      auditLevel: 'full-performance-testing',
      thermalImaging: 'detailed-report',
      ductTesting: 'full-duct-leakage',
      combustionSafety: 'comprehensive',
      region: 'west-coast',
    }) as Record<string, number>;
    // baseLow: 400×2.75=1100, baseHigh: 700×2.75=1925
    // thermal: 200–400, duct: 200–450, combustion: 100–250
    // subtotalLow: 1100+200+200+100=1600, subtotalHigh: 1925+400+450+250=3025
    // totalLow: 1600×1.25=2000, totalHigh: 3025×1.25=3781.25
    expect(result.totalLow).toBeCloseTo(2000, 0);
    expect(result.totalHigh).toBeCloseTo(3781.25, 0);
    expect(result.totalLow).toBeGreaterThan(0);
    expect(result.totalHigh).toBeGreaterThan(result.totalLow);
  });
});
