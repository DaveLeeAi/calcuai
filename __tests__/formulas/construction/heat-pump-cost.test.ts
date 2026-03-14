import { calculateHeatPumpCost } from '@/lib/formulas/construction/heat-pump-cost';

describe('calculateHeatPumpCost', () => {
  // ─── Test 1: Air source standard, medium home, standard efficiency, national ───
  it('calculates air-source-standard base case', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    // Equipment: low = 4000 × 1.20 × 1.0 = 4800, high = 7000 × 1.20 × 1.0 = 8400
    // Labor: low = 2000 × 1.0 = 2000, high = 4000 × 1.0 = 4000
    // TotalLow: 4800 + 2000 = 6800
    // TotalHigh: 8400 + 4000 = 12400
    // TotalMid: (6800 + 12400) / 2 = 9600
    // IRA: min(9600 × 0.30, 2000) = min(2880, 2000) = 2000
    expect(result.totalLow).toBe(6800);
    expect(result.totalHigh).toBe(12400);
    expect(result.totalMid).toBe(9600);
    expect(result.iraTaxCredit).toBe(2000);
    expect(result.totalAfterCredit).toBe(7600);
  });

  // ─── Test 2: Air source cold climate ───
  it('calculates air-source-cold-climate cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-cold-climate',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    // Equipment: 5500 × 1.20 = 6600 low, 9000 × 1.20 = 10800 high
    // Labor: 2500 low, 4500 high
    // TotalLow: 6600 + 2500 = 9100
    // TotalHigh: 10800 + 4500 = 15300
    // TotalMid: (9100 + 15300) / 2 = 12200
    expect(result.totalLow).toBe(9100);
    expect(result.totalHigh).toBe(15300);
    expect(result.totalMid).toBe(12200);
  });

  // ─── Test 3: Ductless mini-split ───
  it('calculates ductless-mini-split cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'ductless-mini-split',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    // Equipment: 3000 × 1.20 = 3600 low, 5000 × 1.20 = 6000 high
    // Labor: 1500 low, 3000 high
    // TotalLow: 3600 + 1500 = 5100
    // TotalHigh: 6000 + 3000 = 9000
    // TotalMid: (5100 + 9000) / 2 = 7050
    expect(result.totalLow).toBe(5100);
    expect(result.totalHigh).toBe(9000);
    expect(result.totalMid).toBe(7050);
  });

  // ─── Test 4: Dual-fuel hybrid ───
  it('calculates dual-fuel-hybrid cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'dual-fuel-hybrid',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    // Equipment: 5000 × 1.20 = 6000 low, 9000 × 1.20 = 10800 high
    // Labor: 2500 low, 5000 high
    // TotalLow: 6000 + 2500 = 8500
    // TotalHigh: 10800 + 5000 = 15800
    // TotalMid: (8500 + 15800) / 2 = 12150
    expect(result.totalLow).toBe(8500);
    expect(result.totalHigh).toBe(15800);
    expect(result.totalMid).toBe(12150);
  });

  // ─── Test 5: Geothermal ───
  it('calculates geothermal cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'geothermal',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    // Equipment: 15000 × 1.20 = 18000 low, 30000 × 1.20 = 36000 high
    // Labor: 8000 low, 15000 high
    // TotalLow: 18000 + 8000 = 26000
    // TotalHigh: 36000 + 15000 = 51000
    // TotalMid: (26000 + 51000) / 2 = 38500
    // IRA: min(38500 × 0.30, 2000) = 2000
    expect(result.totalLow).toBe(26000);
    expect(result.totalHigh).toBe(51000);
    expect(result.totalMid).toBe(38500);
    expect(result.iraTaxCredit).toBe(2000);
    expect(result.totalAfterCredit).toBe(36500);
  });

  // ─── Test 6: Small home size multiplier (1.0x) ───
  it('applies small home size multiplier (1.0x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Equipment: 4000 × 1.0 = 4000 low, 7000 × 1.0 = 7000 high
    // Labor: 2000 low, 4000 high
    // TotalLow: 4000 + 2000 = 6000
    // TotalHigh: 7000 + 4000 = 11000
    expect(result.totalLow).toBe(6000);
    expect(result.totalHigh).toBe(11000);
    expect(result.totalMid).toBe(8500);
  });

  // ─── Test 7: Large home size multiplier (1.45x) ───
  it('applies large home size multiplier (1.45x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'large-2500-3500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Equipment: 4000 × 1.45 = 5800 low, 7000 × 1.45 = 10150 high
    // Labor: 2000 low, 4000 high
    // TotalLow: 5800 + 2000 = 7800
    // TotalHigh: 10150 + 4000 = 14150
    expect(result.totalLow).toBe(7800);
    expect(result.totalHigh).toBe(14150);
  });

  // ─── Test 8: XL home size multiplier (1.75x) ───
  it('applies xlarge home size multiplier (1.75x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'xlarge-over-3500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Equipment: 4000 × 1.75 = 7000 low, 7000 × 1.75 = 12250 high
    // Labor: 2000 low, 4000 high
    // TotalLow: 7000 + 2000 = 9000
    // TotalHigh: 12250 + 4000 = 16250
    expect(result.totalLow).toBe(9000);
    expect(result.totalHigh).toBe(16250);
  });

  // ─── Test 9: High efficiency multiplier (1.20x) ───
  it('applies high efficiency multiplier (1.20x)', () => {
    const small = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    const high = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'high-17-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Equipment standard: 4000 low, 7000 high → mid 5500
    // Equipment high: 4000×1.20=4800 low, 7000×1.20=8400 high → mid 6600
    expect((high.equipmentCost as number)).toBeCloseTo(6600, 0);
    expect((small.equipmentCost as number)).toBeCloseTo(5500, 0);
    // Labor unchanged
    expect(high.laborCost).toBe(small.laborCost);
  });

  // ─── Test 10: Premium efficiency multiplier (1.40x) ───
  it('applies premium efficiency multiplier (1.40x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'premium-20-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Equipment: 4000 × 1.0 × 1.40 = 5600 low, 7000 × 1.0 × 1.40 = 9800 high
    expect(result.totalLow).toBe(5600 + 2000);
    expect(result.totalHigh).toBe(9800 + 4000);
  });

  // ─── Test 11: Electric resistance strip backup heat ───
  it('adds electric resistance strip backup heat cost', () => {
    const noBackup = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    const withStrips = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'electric-resistance-strips',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Backup: low $300, high $800, mid $550
    expect(withStrips.backupHeatCost).toBe(550);
    expect((withStrips.totalLow as number)).toBe((noBackup.totalLow as number) + 300);
    expect((withStrips.totalHigh as number)).toBe((noBackup.totalHigh as number) + 800);
  });

  // ─── Test 12: New gas furnace backup heat ───
  it('adds new gas furnace backup heat cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'new-gas-furnace',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Backup: low $2000, high $3500, mid $2750
    expect(result.backupHeatCost).toBe(2750);
    // TotalLow: 4000 + 2000 + 2000 + 0 = 8000
    // TotalHigh: 7000 + 4000 + 3500 + 0 = 14500
    expect(result.totalLow).toBe(8000);
    expect(result.totalHigh).toBe(14500);
  });

  // ─── Test 13: Existing furnace kept → no cost ───
  it('existing furnace kept adds zero cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'existing-furnace-kept',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    expect(result.backupHeatCost).toBe(0);
  });

  // ─── Test 14: New short-run line set ───
  it('adds new short-run line set cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'new-short-run',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Line set: low $300, high $600, mid $450
    expect(result.lineSetCost).toBe(450);
    // TotalLow: 4000 + 2000 + 0 + 300 = 6300
    // TotalHigh: 7000 + 4000 + 0 + 600 = 11600
    expect(result.totalLow).toBe(6300);
    expect(result.totalHigh).toBe(11600);
  });

  // ─── Test 15: New long-run line set ───
  it('adds new long-run line set cost', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'new-long-run',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Line set: low $600, high $1200, mid $900
    expect(result.lineSetCost).toBe(900);
    expect(result.totalLow).toBe(4000 + 2000 + 0 + 600);
    expect(result.totalHigh).toBe(7000 + 4000 + 0 + 1200);
  });

  // ─── Test 16: IRA credit ON — capped at $2000 ───
  it('caps IRA tax credit at $2000 for large subtotals', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'geothermal',
      homeSize: 'xlarge-over-3500',
      efficiency: 'premium-20-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    // Subtotal will be very large → 30% exceeds $2000
    expect(result.iraTaxCredit).toBe(2000);
  });

  // ─── Test 17: IRA credit OFF ───
  it('returns zero IRA credit when disabled', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    expect(result.iraTaxCredit).toBe(0);
    expect(result.totalAfterCredit).toBe(result.totalMid);
  });

  // ─── Test 18: IRA credit < $2000 for cheap mini-split ───
  it('IRA credit is 30% when below $2000 cap', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'ductless-mini-split',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'south',
    });
    // Equipment: 3000 low, 5000 high
    // Labor: 1500 × 0.85 = 1275 low, 3000 × 0.85 = 2550 high
    // TotalLow: 3000 + 1275 = 4275
    // TotalHigh: 5000 + 2550 = 7550
    // TotalMid: (4275 + 7550) / 2 = 5912.50
    // IRA: 5912.50 × 0.30 = 1773.75 → under cap
    expect(result.totalMid).toBe(5912.5);
    expect(result.iraTaxCredit).toBe(1773.75);
    expect(result.totalAfterCredit).toBe(5912.5 - 1773.75);
  });

  // ─── Test 19: Northeast region multiplier (1.20x) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    const northeast = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'northeast',
    });
    // Labor national: (2000+4000)/2 = 3000
    // Labor northeast: (2000×1.20 + 4000×1.20)/2 = (2400+4800)/2 = 3600
    expect(northeast.laborCost).toBe(3600);
    expect(national.laborCost).toBe(3000);
    // Equipment unchanged
    expect(northeast.equipmentCost).toBe(national.equipmentCost);
  });

  // ─── Test 20: South region multiplier (0.85x) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'south',
    });
    // Labor: (2000×0.85 + 4000×0.85)/2 = (1700+3400)/2 = 2550
    expect(result.laborCost).toBe(2550);
  });

  // ─── Test 21: West Coast region multiplier (1.25x — highest) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'west-coast',
    });
    // Labor: (2000×1.25 + 4000×1.25)/2 = (2500+5000)/2 = 3750
    expect(result.laborCost).toBe(3750);
  });

  // ─── Test 22: Mid-Atlantic region multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'mid-atlantic',
    });
    // Labor: (2000×1.15 + 4000×1.15)/2 = (2300+4600)/2 = 3450
    expect(result.laborCost).toBe(3450);
  });

  // ─── Test 23: Midwest region multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'midwest',
    });
    // Labor: (2000×0.90 + 4000×0.90)/2 = (1800+3600)/2 = 2700
    expect(result.laborCost).toBe(2700);
  });

  // ─── Test 24: Mountain West region multiplier (0.95x) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'mountain-west',
    });
    // Labor: (2000×0.95 + 4000×0.95)/2 = (1900+3800)/2 = 2850
    expect(result.laborCost).toBe(2850);
  });

  // ─── Test 25: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateHeatPumpCost({});
    // Defaults: air-source-standard, medium, standard-15-seer2, none, existing-reuse, IRA true, national
    expect((result.totalMid as number)).toBeGreaterThan(0);
    expect((result.iraTaxCredit as number)).toBeGreaterThanOrEqual(0);
    expect(result.totalAfterCredit).toBeDefined();
  });

  // ─── Test 26: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    expect(result).toHaveProperty('equipmentCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('backupHeatCost');
    expect(result).toHaveProperty('lineSetCost');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('iraTaxCredit');
    expect(result).toHaveProperty('totalAfterCredit');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('pumpTypeComparison');
    expect(result).toHaveProperty('annualSavingsVsGas');
    expect(result).toHaveProperty('paybackPeriod');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 27: Pump type comparison has all 5 types ───
  it('returns pump type comparison with all 5 types', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    const comparison = result.pumpTypeComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Mini-split cheapest, geothermal most expensive
    const miniSplit = comparison.find(c => c.label.includes('Mini-Split'));
    const geothermal = comparison.find(c => c.label.includes('Geothermal'));
    expect(miniSplit!.value).toBeLessThan(geothermal!.value);
  });

  // ─── Test 28: Annual savings text is returned ───
  it('returns annual savings text for each pump type', () => {
    const types = ['air-source-standard', 'air-source-cold-climate', 'ductless-mini-split', 'dual-fuel-hybrid', 'geothermal'];
    types.forEach(t => {
      const result = calculateHeatPumpCost({ pumpType: t });
      expect(typeof result.annualSavingsVsGas).toBe('string');
      expect((result.annualSavingsVsGas as string).length).toBeGreaterThan(0);
    });
  });

  // ─── Test 29: Payback period text is returned ───
  it('returns payback period text for each pump type', () => {
    const types = ['air-source-standard', 'air-source-cold-climate', 'ductless-mini-split', 'dual-fuel-hybrid', 'geothermal'];
    types.forEach(t => {
      const result = calculateHeatPumpCost({ pumpType: t });
      expect(typeof result.paybackPeriod).toBe('string');
      expect((result.paybackPeriod as string).length).toBeGreaterThan(0);
    });
  });

  // ─── Test 30: Timeline text is returned ───
  it('returns timeline text for each pump type', () => {
    const result = calculateHeatPumpCost({ pumpType: 'geothermal' });
    expect(result.timeline).toBe('1–2 weeks (includes ground loop)');
    const miniResult = calculateHeatPumpCost({ pumpType: 'ductless-mini-split' });
    expect(miniResult.timeline).toBe('1–3 days (varies by zone count)');
  });

  // ─── Test 31: Combined add-ons (backup + line set) ───
  it('combines backup heat and line set costs', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'small-under-1500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'new-gas-furnace',
      lineSet: 'new-long-run',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    // Equipment: 4000 low, 7000 high
    // Labor: 2000 low, 4000 high
    // Backup: 2000 low, 3500 high
    // Line: 600 low, 1200 high
    // TotalLow: 4000 + 2000 + 2000 + 600 = 8600
    // TotalHigh: 7000 + 4000 + 3500 + 1200 = 15700
    expect(result.totalLow).toBe(8600);
    expect(result.totalHigh).toBe(15700);
    expect(result.backupHeatCost).toBe(2750);
    expect(result.lineSetCost).toBe(900);
  });

  // ─── Test 32: totalAfterCredit = subtotal - iraTaxCredit ───
  it('totalAfterCredit equals subtotal minus IRA credit', () => {
    const result = calculateHeatPumpCost({
      pumpType: 'air-source-standard',
      homeSize: 'medium-1500-2500',
      efficiency: 'standard-15-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'true',
      region: 'national',
    });
    expect(result.totalAfterCredit).toBe(
      parseFloat(((result.subtotal as number) - (result.iraTaxCredit as number)).toFixed(2))
    );
  });

  // ─── Test 33: Regional multiplier only affects labor ───
  it('regional multiplier changes labor but not equipment cost', () => {
    const national = calculateHeatPumpCost({
      pumpType: 'dual-fuel-hybrid',
      homeSize: 'large-2500-3500',
      efficiency: 'high-17-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'national',
    });
    const westCoast = calculateHeatPumpCost({
      pumpType: 'dual-fuel-hybrid',
      homeSize: 'large-2500-3500',
      efficiency: 'high-17-seer2',
      backupHeat: 'none',
      lineSet: 'existing-reuse',
      claimIRATaxCredit: 'false',
      region: 'west-coast',
    });
    expect(national.equipmentCost).toBe(westCoast.equipmentCost);
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });
});
