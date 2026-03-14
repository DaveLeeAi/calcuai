import { calculateElectricalPanelUpgradeCost } from '@/lib/formulas/construction/electrical-panel-upgrade-cost';

describe('calculateElectricalPanelUpgradeCost', () => {
  // ─── Test 1: Standard 100-to-200 upgrade, national, standard brand, no extras ───
  it('calculates a standard 100-to-200 upgrade with no extras', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Panel: $1500-$3000 × 1.0 = $1500-$3000
    // Labor: $800-$1500 × 1.0 = $800-$1500
    // Circuits: $0
    // Permit: $150-$400
    // Surge: $0
    // TotalLow: 1500 + 800 + 0 + 150 + 0 = $2450
    // TotalHigh: 3000 + 1500 + 0 + 400 + 0 = $4900
    // TotalMid: (2450 + 4900) / 2 = $3675
    expect(result.totalLow).toBe(2450);
    expect(result.totalHigh).toBe(4900);
    expect(result.totalMid).toBe(3675);
    expect(result.panelCost).toBe(2250);  // (1500+3000)/2
    expect(result.laborCost).toBe(1150);  // (800+1500)/2
    expect(result.circuitCost).toBe(0);
    expect(result.permitCost).toBe(275);  // (150+400)/2
    expect(result.surgeCost).toBe(0);
  });

  // ─── Test 2: Panel swap same amp ───
  it('calculates a panel swap same amp cost', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'panel-swap-same-amp',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Panel: $1000-$1800
    // Labor: $500-$1000
    // Permit: $150-$400
    // TotalLow: 1000 + 500 + 150 = $1650
    // TotalHigh: 1800 + 1000 + 400 = $3200
    expect(result.totalLow).toBe(1650);
    expect(result.totalHigh).toBe(3200);
    expect(result.totalMid).toBe(2425);
  });

  // ─── Test 3: Upgrade to 400A ───
  it('calculates a 400A upgrade cost', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-to-400',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Panel: $3000-$5000
    // Labor: $1500-$2500
    // Permit: $150-$400
    // TotalLow: 3000 + 1500 + 150 = $4650
    // TotalHigh: 5000 + 2500 + 400 = $7900
    expect(result.totalLow).toBe(4650);
    expect(result.totalHigh).toBe(7900);
    expect(result.totalMid).toBe(6275);
  });

  // ─── Test 4: Sub-panel addition ───
  it('calculates a sub-panel addition cost', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'sub-panel-add',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Panel: $800-$1500
    // Labor: $400-$800
    // Permit: $150-$400
    // TotalLow: 800 + 400 + 150 = $1350
    // TotalHigh: 1500 + 800 + 400 = $2700
    expect(result.totalLow).toBe(1350);
    expect(result.totalHigh).toBe(2700);
    expect(result.totalMid).toBe(2025);
  });

  // ─── Test 5: Mid-grade panel brand multiplier ───
  it('applies mid-grade brand multiplier (1.15x) to panel cost only', () => {
    const standard = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const midGrade = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'mid-grade',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Panel cost increases, labor stays the same
    expect((midGrade.panelCost as number)).toBeGreaterThan((standard.panelCost as number));
    expect(midGrade.laborCost).toBe(standard.laborCost);
    // Panel low: 1500 × 1.15 = 1725, high: 3000 × 1.15 = 3450
    // TotalLow: 1725 + 800 = 2525
    // TotalHigh: 3450 + 1500 = 4950
    expect(midGrade.totalLow).toBe(2525);
    expect(midGrade.totalHigh).toBe(4950);
  });

  // ─── Test 6: Premium panel brand multiplier ───
  it('applies premium brand multiplier (1.30x) to panel cost only', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'premium',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Panel low: 1500 × 1.30 = 1950, high: 3000 × 1.30 = 3900
    // Labor: 800-1500 (unchanged)
    // TotalLow: 1950 + 800 = 2750
    // TotalHigh: 3900 + 1500 = 5400
    expect(result.totalLow).toBe(2750);
    expect(result.totalHigh).toBe(5400);
    expect(result.panelCost).toBe(2925); // (1950+3900)/2
  });

  // ─── Test 7: Additional circuits 2-4 ───
  it('adds 2-4 additional circuits cost', () => {
    const noCircuits = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const withCircuits = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: '2-4-circuits',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    // Circuits: $200-$400
    expect(withCircuits.circuitCost).toBe(300); // (200+400)/2
    expect((withCircuits.totalLow as number)).toBe((noCircuits.totalLow as number) + 200);
    expect((withCircuits.totalHigh as number)).toBe((noCircuits.totalHigh as number) + 400);
  });

  // ─── Test 8: Additional circuits 5-8 ───
  it('adds 5-8 additional circuits cost', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: '5-8-circuits',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    expect(result.circuitCost).toBe(600); // (400+800)/2
  });

  // ─── Test 9: Additional circuits 10+ ───
  it('adds 10+ additional circuits cost', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: '10-plus-circuits',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    expect(result.circuitCost).toBe(1150); // (800+1500)/2
  });

  // ─── Test 10: Permit included vs not needed ───
  it('adds permit cost when included', () => {
    const noPermit = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const withPermit = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    expect(noPermit.permitCost).toBe(0);
    expect(withPermit.permitCost).toBe(275); // (150+400)/2
    expect((withPermit.totalLow as number)).toBe((noPermit.totalLow as number) + 150);
    expect((withPermit.totalHigh as number)).toBe((noPermit.totalHigh as number) + 400);
  });

  // ─── Test 11: Whole-house surge protector ───
  it('adds surge protector cost when enabled', () => {
    const noSurge = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const withSurge = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'yes',
      region: 'national',
    });
    expect(noSurge.surgeCost).toBe(0);
    expect(withSurge.surgeCost).toBe(350); // (200+500)/2
    expect((withSurge.totalLow as number)).toBe((noSurge.totalLow as number) + 200);
    expect((withSurge.totalHigh as number)).toBe((noSurge.totalHigh as number) + 500);
  });

  // ─── Test 12: Northeast region multiplier ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const northeast = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'northeast',
    });
    // Labor increases, panel stays same
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
    expect(northeast.panelCost).toBe(national.panelCost);
    // Labor low: 800 × 1.20 = 960, high: 1500 × 1.20 = 1800, mid: 1380
    expect(northeast.laborCost).toBe(1380);
  });

  // ─── Test 13: South region multiplier (cheapest labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const south = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
    // Labor low: 800 × 0.85 = 680, high: 1500 × 0.85 = 1275, mid: 977.50
    expect(south.laborCost).toBe(977.5);
  });

  // ─── Test 14: West Coast region multiplier (most expensive) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'west-coast',
    });
    // Labor low: 800 × 1.25 = 1000, high: 1500 × 1.25 = 1875, mid: 1437.50
    expect(result.laborCost).toBe(1437.5);
    // TotalLow: 1500 + 1000 = 2500
    // TotalHigh: 3000 + 1875 = 4875
    expect(result.totalLow).toBe(2500);
    expect(result.totalHigh).toBe(4875);
  });

  // ─── Test 15: Midwest region multiplier ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'midwest',
    });
    // Labor low: 800 × 0.90 = 720, high: 1500 × 0.90 = 1350, mid: 1035
    expect(result.laborCost).toBe(1035);
  });

  // ─── Test 16: Mid-Atlantic region multiplier ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'mid-atlantic',
    });
    // Labor low: 800 × 1.15 = 920, high: 1500 × 1.15 = 1725, mid: 1322.50
    expect(result.laborCost).toBe(1322.5);
  });

  // ─── Test 17: Mountain West region multiplier ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'mountain-west',
    });
    // Labor low: 800 × 0.95 = 760, high: 1500 × 0.95 = 1425, mid: 1092.50
    expect(result.laborCost).toBe(1092.5);
  });

  // ─── Test 18: All extras combined (circuits + permit + surge) ───
  it('combines all extras correctly', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: '5-8-circuits',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'yes',
      region: 'national',
    });
    // Panel: 1500-3000
    // Labor: 800-1500
    // Circuits: 400-800
    // Permit: 150-400
    // Surge: 200-500
    // TotalLow: 1500 + 800 + 400 + 150 + 200 = 3050
    // TotalHigh: 3000 + 1500 + 800 + 400 + 500 = 6200
    expect(result.totalLow).toBe(3050);
    expect(result.totalHigh).toBe(6200);
    expect(result.totalMid).toBe(4625);
  });

  // ─── Test 19: Upgrade comparison structure ───
  it('returns upgrade comparison with all 4 types', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const comparison = result.upgradeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Sub-panel should be cheapest, 400A most expensive
    const subPanel = comparison.find(c => c.label.includes('Sub-Panel'));
    const upgrade400 = comparison.find(c => c.label.includes('400A'));
    expect(subPanel!.value).toBeLessThan(upgrade400!.value);
  });

  // ─── Test 20: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    expect(result).toHaveProperty('panelCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('circuitCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('surgeCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('upgradeComparison');
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('safetyNote');
  });

  // ─── Test 21: Timeline output per upgrade type ───
  it('returns correct timeline for each upgrade type', () => {
    const panelSwap = calculateElectricalPanelUpgradeCost({
      upgradeType: 'panel-swap-same-amp', panelBrand: 'standard',
      additionalCircuits: 'none', permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no', region: 'national',
    });
    const upgrade200 = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200', panelBrand: 'standard',
      additionalCircuits: 'none', permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no', region: 'national',
    });
    const upgrade400 = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-to-400', panelBrand: 'standard',
      additionalCircuits: 'none', permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no', region: 'national',
    });
    const subPanel = calculateElectricalPanelUpgradeCost({
      upgradeType: 'sub-panel-add', panelBrand: 'standard',
      additionalCircuits: 'none', permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no', region: 'national',
    });
    expect(panelSwap.timeline).toBe('4–8 hours');
    expect(upgrade200.timeline).toBe('1–2 days');
    expect(upgrade400.timeline).toBe('2–3 days');
    expect(subPanel.timeline).toBe('4–6 hours');
  });

  // ─── Test 22: Safety note is always present ───
  it('always includes a safety note', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    expect(typeof result.safetyNote).toBe('string');
    expect((result.safetyNote as string).length).toBeGreaterThan(0);
    expect((result.safetyNote as string)).toContain('licensed electrician');
  });

  // ─── Test 23: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateElectricalPanelUpgradeCost({});
    // Defaults: upgrade-100-to-200, standard, none, included, no, national
    expect(result.totalLow).toBe(2450);
    expect(result.totalHigh).toBe(4900);
    expect(result.totalMid).toBe(3675);
  });

  // ─── Test 24: Premium brand + West Coast + all extras (max cost scenario) ───
  it('calculates maximum cost scenario correctly', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-to-400',
      panelBrand: 'premium',
      additionalCircuits: '10-plus-circuits',
      permitInspection: 'included',
      wholeHouseSurgeProtector: 'yes',
      region: 'west-coast',
    });
    // Panel: 3000×1.30=3900 low, 5000×1.30=6500 high
    // Labor: 1500×1.25=1875 low, 2500×1.25=3125 high
    // Circuits: 800-1500
    // Permit: 150-400
    // Surge: 200-500
    // TotalLow: 3900 + 1875 + 800 + 150 + 200 = 6925
    // TotalHigh: 6500 + 3125 + 1500 + 400 + 500 = 12025
    expect(result.totalLow).toBe(6925);
    expect(result.totalHigh).toBe(12025);
    expect(result.totalMid).toBe(9475);
  });

  // ─── Test 25: Sub-panel + South region (minimum cost scenario) ───
  it('calculates minimum cost scenario correctly', () => {
    const result = calculateElectricalPanelUpgradeCost({
      upgradeType: 'sub-panel-add',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'south',
    });
    // Panel: 800-1500
    // Labor: 400×0.85=340 low, 800×0.85=680 high
    // TotalLow: 800 + 340 = 1140
    // TotalHigh: 1500 + 680 = 2180
    expect(result.totalLow).toBe(1140);
    expect(result.totalHigh).toBe(2180);
    expect(result.totalMid).toBe(1660);
  });

  // ─── Test 26: Regional multiplier only affects labor, not panel cost ───
  it('regional multiplier changes labor but not panel cost', () => {
    const national = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'mid-grade',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'national',
    });
    const northeast = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'mid-grade',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'northeast',
    });
    expect(national.panelCost).toBe(northeast.panelCost);
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 27: Brand multiplier only affects panel, not labor cost ───
  it('brand multiplier changes panel but not labor cost', () => {
    const standard = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'standard',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'northeast',
    });
    const premium = calculateElectricalPanelUpgradeCost({
      upgradeType: 'upgrade-100-to-200',
      panelBrand: 'premium',
      additionalCircuits: 'none',
      permitInspection: 'not-needed',
      wholeHouseSurgeProtector: 'no',
      region: 'northeast',
    });
    expect(standard.laborCost).toBe(premium.laborCost);
    expect((premium.panelCost as number)).toBeGreaterThan((standard.panelCost as number));
  });

  // ─── Test 28: Upgrade ordering — sub-panel cheapest, 400A most expensive ───
  it('sub-panel is cheapest and 400A is most expensive', () => {
    const types = ['panel-swap-same-amp', 'upgrade-100-to-200', 'upgrade-to-400', 'sub-panel-add'];
    const costs = types.map(t => {
      const r = calculateElectricalPanelUpgradeCost({
        upgradeType: t, panelBrand: 'standard',
        additionalCircuits: 'none', permitInspection: 'not-needed',
        wholeHouseSurgeProtector: 'no', region: 'national',
      });
      return { type: t, mid: r.totalMid as number };
    });
    const subPanel = costs.find(c => c.type === 'sub-panel-add')!;
    const upgrade400 = costs.find(c => c.type === 'upgrade-to-400')!;
    const panelSwap = costs.find(c => c.type === 'panel-swap-same-amp')!;
    expect(subPanel.mid).toBeLessThan(panelSwap.mid);
    expect(panelSwap.mid).toBeLessThan(upgrade400.mid);
  });
});
