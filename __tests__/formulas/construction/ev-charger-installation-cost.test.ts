import { calculateEvChargerInstallationCost } from '@/lib/formulas/construction/ev-charger-installation-cost';

describe('calculateEvChargerInstallationCost', () => {
  // ─── Test 1: Level 2 32A, basic brand, under 25ft, no panel, permit, national ───
  it('calculates a basic Level 2 32A charger at national average', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp',
      chargerBrand: 'basic',
      circuitDistance: 'under-25ft',
      panelUpgrade: 'none',
      permitRequired: 'yes',
      region: 'national',
    });
    // Charger: $300–$600 × 1.0 = $300–$600
    // Labor: $400–$800 × 1.0 × 1.0 = $400–$800
    // Panel: $0, Permit: $75–$250
    // TotalLow: 300 + 400 + 0 + 75 = $775
    // TotalHigh: 600 + 800 + 0 + 250 = $1650
    // TotalMid: (775 + 1650) / 2 = $1212.50
    expect(result.totalLow).toBe(775);
    expect(result.totalHigh).toBe(1650);
    expect(result.totalMid).toBe(1212.5);
    expect(result.chargerCost).toBe(450);   // (300 + 600) / 2
    expect(result.laborCost).toBe(600);     // (400 + 800) / 2
    expect(result.panelCost).toBe(0);
    expect(result.permitCost).toBe(162.5);  // (75 + 250) / 2
  });

  // ─── Test 2: Level 1 — $0 charger cost ───
  it('calculates level 1 with zero charger cost (included EVSE)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-1',
      chargerBrand: 'basic',
      circuitDistance: 'under-25ft',
      panelUpgrade: 'none',
      permitRequired: 'yes',
      region: 'national',
    });
    // Charger: $0 × 1.0 = $0
    // Labor: $100–$200 × 1.0 × 1.0 = $100–$200
    // Permit: $75–$250
    // TotalLow: 0 + 100 + 0 + 75 = $175
    // TotalHigh: 0 + 200 + 0 + 250 = $450
    expect(result.chargerCost).toBe(0);
    expect(result.totalLow).toBe(175);
    expect(result.totalHigh).toBe(450);
    expect(result.totalMid).toBe(312.5);
  });

  // ─── Test 3: Level 2 48A, basic, national ───
  it('calculates a Level 2 48A charger', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-48amp',
      chargerBrand: 'basic',
      circuitDistance: 'under-25ft',
      panelUpgrade: 'none',
      permitRequired: 'yes',
      region: 'national',
    });
    // Charger: $500–$900, Labor: $500–$1000
    // TotalLow: 500 + 500 + 0 + 75 = $1075
    // TotalHigh: 900 + 1000 + 0 + 250 = $2150
    expect(result.totalLow).toBe(1075);
    expect(result.totalHigh).toBe(2150);
    expect(result.totalMid).toBe(1612.5);
  });

  // ─── Test 4: Level 2 80A, basic, national ───
  it('calculates a Level 2 80A charger', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-80amp',
      chargerBrand: 'basic',
      circuitDistance: 'under-25ft',
      panelUpgrade: 'none',
      permitRequired: 'yes',
      region: 'national',
    });
    // Charger: $700–$1200, Labor: $600–$1200
    // TotalLow: 700 + 600 + 0 + 75 = $1375
    // TotalHigh: 1200 + 1200 + 0 + 250 = $2650
    expect(result.totalLow).toBe(1375);
    expect(result.totalHigh).toBe(2650);
    expect(result.totalMid).toBe(2012.5);
  });

  // ─── Test 5: Mid-range brand multiplier (1.15x) ───
  it('applies mid-range brand multiplier (1.15x) to charger cost', () => {
    const basic = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const midRange = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'mid-range',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    // Charger: $300 × 1.15 = $345 low, $600 × 1.15 = $690 high
    expect((midRange.chargerCost as number)).toBeCloseTo((basic.chargerCost as number) * 1.15, 1);
    // Labor stays the same
    expect(midRange.laborCost).toBe(basic.laborCost);
    // TotalLow: 345 + 400 + 0 + 75 = $820
    expect(midRange.totalLow).toBe(820);
    // TotalHigh: 690 + 800 + 0 + 250 = $1740
    expect(midRange.totalHigh).toBe(1740);
  });

  // ─── Test 6: Premium brand multiplier (1.40x) ───
  it('applies premium brand multiplier (1.40x) to charger cost', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'premium',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    // Charger: $300 × 1.40 = $420 low, $600 × 1.40 = $840 high
    // TotalLow: 420 + 400 + 0 + 75 = $895
    // TotalHigh: 840 + 800 + 0 + 250 = $1890
    expect(result.totalLow).toBe(895);
    expect(result.totalHigh).toBe(1890);
  });

  // ─── Test 7: Tesla Wall Connector brand multiplier (1.25x) ───
  it('applies tesla wall connector brand multiplier (1.25x)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'tesla-wall-connector',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    // Charger: $300 × 1.25 = $375 low, $600 × 1.25 = $750 high
    // TotalLow: 375 + 400 + 0 + 75 = $850
    // TotalHigh: 750 + 800 + 0 + 250 = $1800
    expect(result.totalLow).toBe(850);
    expect(result.totalHigh).toBe(1800);
  });

  // ─── Test 8: Circuit distance 25-50ft multiplier (1.20x on labor) ───
  it('applies 25-50ft circuit distance multiplier (1.20x) to labor', () => {
    const short = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const medium = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: '25-50ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    // Charger stays the same
    expect(medium.chargerCost).toBe(short.chargerCost);
    // Labor: $400 × 1.20 = $480 low, $800 × 1.20 = $960 high
    expect((medium.laborCost as number)).toBeCloseTo((short.laborCost as number) * 1.20, 1);
    // TotalLow: 300 + 480 + 0 + 75 = $855
    expect(medium.totalLow).toBe(855);
    // TotalHigh: 600 + 960 + 0 + 250 = $1810
    expect(medium.totalHigh).toBe(1810);
  });

  // ─── Test 9: Circuit distance over-50ft multiplier (1.50x on labor) ───
  it('applies over-50ft circuit distance multiplier (1.50x) to labor', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'over-50ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    // Labor: $400 × 1.50 = $600 low, $800 × 1.50 = $1200 high
    // TotalLow: 300 + 600 + 0 + 75 = $975
    // TotalHigh: 600 + 1200 + 0 + 250 = $2050
    expect(result.totalLow).toBe(975);
    expect(result.totalHigh).toBe(2050);
  });

  // ─── Test 10: Subpanel add-on ($500–$1500) ───
  it('adds subpanel upgrade cost ($500–$1500)', () => {
    const noPanel = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const subpanel = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'subpanel',
      permitRequired: 'yes', region: 'national',
    });
    expect(subpanel.panelCost).toBe(1000); // (500 + 1500) / 2
    expect((subpanel.totalLow as number)).toBe((noPanel.totalLow as number) + 500);
    expect((subpanel.totalHigh as number)).toBe((noPanel.totalHigh as number) + 1500);
  });

  // ─── Test 11: Main panel upgrade add-on ($1500–$3000) ───
  it('adds main panel upgrade cost ($1500–$3000)', () => {
    const noPanel = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const mainPanel = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'main-panel-upgrade',
      permitRequired: 'yes', region: 'national',
    });
    expect(mainPanel.panelCost).toBe(2250); // (1500 + 3000) / 2
    expect((mainPanel.totalLow as number)).toBe((noPanel.totalLow as number) + 1500);
    expect((mainPanel.totalHigh as number)).toBe((noPanel.totalHigh as number) + 3000);
  });

  // ─── Test 12: No permit ───
  it('removes permit cost when not required', () => {
    const withPermit = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const noPermit = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'no', region: 'national',
    });
    expect(noPermit.permitCost).toBe(0);
    expect((noPermit.totalLow as number)).toBe((withPermit.totalLow as number) - 75);
    expect((noPermit.totalHigh as number)).toBe((withPermit.totalHigh as number) - 250);
  });

  // ─── Test 13: Northeast region multiplier (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const northeast = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'northeast',
    });
    // Charger stays the same
    expect(northeast.chargerCost).toBe(national.chargerCost);
    // Labor: national mid $600, northeast mid = $600 × 1.20 = $720
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 1);
    // TotalLow: 300 + 480 + 0 + 75 = $855
    expect(northeast.totalLow).toBe(855);
    // TotalHigh: 600 + 960 + 0 + 250 = $1810
    expect(northeast.totalHigh).toBe(1810);
  });

  // ─── Test 14: South region multiplier (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'south',
    });
    // Labor: $400 × 0.85 = $340 low, $800 × 0.85 = $680 high
    // TotalLow: 300 + 340 + 0 + 75 = $715
    // TotalHigh: 600 + 680 + 0 + 250 = $1530
    expect(result.totalLow).toBe(715);
    expect(result.totalHigh).toBe(1530);
  });

  // ─── Test 15: West Coast region multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'west-coast',
    });
    // Labor: $400 × 1.25 = $500 low, $800 × 1.25 = $1000 high
    // TotalLow: 300 + 500 + 0 + 75 = $875
    // TotalHigh: 600 + 1000 + 0 + 250 = $1850
    expect(result.totalLow).toBe(875);
    expect(result.totalHigh).toBe(1850);
  });

  // ─── Test 16: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'midwest',
    });
    // Labor: $400 × 0.90 = $360 low, $800 × 0.90 = $720 high
    // TotalLow: 300 + 360 + 0 + 75 = $735
    // TotalHigh: 600 + 720 + 0 + 250 = $1570
    expect(result.totalLow).toBe(735);
    expect(result.totalHigh).toBe(1570);
  });

  // ─── Test 17: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'mid-atlantic',
    });
    // Labor: $400 × 1.15 = $460 low, $800 × 1.15 = $920 high
    // TotalLow: 300 + 460 + 0 + 75 = $835
    // TotalHigh: 600 + 920 + 0 + 250 = $1770
    expect(result.totalLow).toBe(835);
    expect(result.totalHigh).toBe(1770);
  });

  // ─── Test 18: Mountain West region multiplier (0.95x) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'mountain-west',
    });
    // Labor: $400 × 0.95 = $380 low, $800 × 0.95 = $760 high
    // TotalLow: 300 + 380 + 0 + 75 = $755
    // TotalHigh: 600 + 760 + 0 + 250 = $1610
    expect(result.totalLow).toBe(755);
    expect(result.totalHigh).toBe(1610);
  });

  // ─── Test 19: Stacked multipliers — premium brand + over-50ft + northeast ───
  it('stacks brand, distance, and region multipliers correctly', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-48amp', chargerBrand: 'premium',
      circuitDistance: 'over-50ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'northeast',
    });
    // Charger: $500 × 1.40 = $700 low, $900 × 1.40 = $1260 high
    // Labor: $500 × 1.50 × 1.20 = $900 low, $1000 × 1.50 × 1.20 = $1800 high
    // Panel: $0, Permit: $75–$250
    // TotalLow: 700 + 900 + 0 + 75 = $1675
    // TotalHigh: 1260 + 1800 + 0 + 250 = $3310
    expect(result.totalLow).toBe(1675);
    expect(result.totalHigh).toBe(3310);
    expect(result.totalMid).toBe(2492.5);
  });

  // ─── Test 20: Full build — 80A, premium, over-50ft, main panel, permit, west-coast ───
  it('calculates fully loaded Level 2 80A installation with all extras', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-80amp',
      chargerBrand: 'premium',
      circuitDistance: 'over-50ft',
      panelUpgrade: 'main-panel-upgrade',
      permitRequired: 'yes',
      region: 'west-coast',
    });
    // Charger: $700 × 1.40 = $980 low, $1200 × 1.40 = $1680 high
    // Labor: $600 × 1.50 × 1.25 = $1125 low, $1200 × 1.50 × 1.25 = $2250 high
    // Panel: $1500 low, $3000 high
    // Permit: $75 low, $250 high
    // TotalLow: 980 + 1125 + 1500 + 75 = $3680
    // TotalHigh: 1680 + 2250 + 3000 + 250 = $7180
    expect(result.totalLow).toBe(3680);
    expect(result.totalHigh).toBe(7180);
    expect(result.totalMid).toBe(5430);
  });

  // ─── Test 21: Charger comparison structure ───
  it('returns charger level comparison with all 4 levels', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    const comparison = result.chargerComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(4);
    comparison.forEach(item => {
      expect(item.label).toBeTruthy();
      expect(typeof item.value).toBe('number');
    });
    // Level 1 should be cheapest, Level 2 80A most expensive
    const level1 = comparison.find(c => c.label.includes('Level 1'));
    const level80 = comparison.find(c => c.label.includes('80A'));
    expect(level1!.value).toBeLessThan(level80!.value);
  });

  // ─── Test 22: Charging speed output ───
  it('returns correct charging speed for each level', () => {
    const l1 = calculateEvChargerInstallationCost({
      chargerLevel: 'level-1', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    expect(l1.chargingSpeed).toBe('3–5 miles of range per hour (120V, ~1.4 kW)');

    const l2_32 = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    expect(l2_32.chargingSpeed).toBe('20–25 miles of range per hour (240V, ~7.7 kW)');

    const l2_80 = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-80amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    expect(l2_80.chargingSpeed).toBe('40–50 miles of range per hour (240V, ~19.2 kW)');
  });

  // ─── Test 23: Timeline output ───
  it('returns correct timeline for each charger level', () => {
    const l1 = calculateEvChargerInstallationCost({
      chargerLevel: 'level-1', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    expect(l1.timeline).toBe('1–2 hours (outlet installation only)');

    const l2 = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    expect(l2.timeline).toBe('2–4 hours (dedicated circuit + charger mount)');
  });

  // ─── Test 24: Timeline with panel upgrade appends note ───
  it('appends panel work note to timeline when panel upgrade selected', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'subpanel',
      permitRequired: 'yes', region: 'national',
    });
    expect(result.timeline).toBe('2–4 hours (dedicated circuit + charger mount) + panel work adds 4–8 hours');
  });

  // ─── Test 25: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-32amp', chargerBrand: 'basic',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    expect(result).toHaveProperty('chargerCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('panelCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('chargerComparison');
    expect(result).toHaveProperty('chargingSpeed');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 26: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateEvChargerInstallationCost({});
    // Defaults: level-2-32amp, basic, under-25ft, no panel, yes permit, national
    expect(result.totalLow).toBe(775);
    expect(result.totalHigh).toBe(1650);
  });

  // ─── Test 27: Regional multiplier only affects labor, not charger/panel/permit ───
  it('regional multiplier changes labor but not charger, panel, or permit cost', () => {
    const national = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-48amp', chargerBrand: 'mid-range',
      circuitDistance: 'under-25ft', panelUpgrade: 'subpanel',
      permitRequired: 'yes', region: 'national',
    });
    const westCoast = calculateEvChargerInstallationCost({
      chargerLevel: 'level-2-48amp', chargerBrand: 'mid-range',
      circuitDistance: 'under-25ft', panelUpgrade: 'subpanel',
      permitRequired: 'yes', region: 'west-coast',
    });
    expect(westCoast.chargerCost).toBe(national.chargerCost);
    expect(westCoast.panelCost).toBe(national.panelCost);
    expect(westCoast.permitCost).toBe(national.permitCost);
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 28: Brand multiplier on Level 1 ($0 charger) still $0 ───
  it('brand multiplier on level-1 still produces $0 charger cost', () => {
    const result = calculateEvChargerInstallationCost({
      chargerLevel: 'level-1', chargerBrand: 'premium',
      circuitDistance: 'under-25ft', panelUpgrade: 'none',
      permitRequired: 'yes', region: 'national',
    });
    // $0 × 1.40 = $0
    expect(result.chargerCost).toBe(0);
  });
});
