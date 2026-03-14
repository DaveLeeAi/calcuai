import { calculateSolarBatteryCost } from '@/lib/formulas/construction/solar-battery-cost';

describe('calculateSolarBatteryCost', () => {
  // ─── Test 1: Standard 13.5 kWh NMC, hybrid inverter, no add-ons, IRA credit, national ───
  it('calculates standard 13.5 kWh NMC battery with IRA credit', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'yes',
      electricalUpgrade: 'none',
      region: 'national',
    });
    // Battery: $9000–$14000 × 1.0 = $9000–$14000
    // Labor: 9000×0.25=$2250 low, 14000×0.25=$3500 high
    // Subtotal: 9000+2250=$11250 low, 14000+3500=$17500 high
    // IRA: 11250×0.30=$3375 low, 17500×0.30=$5250 high
    // Total: 11250-3375=$7875 low, 17500-5250=$12250 high
    // Mid: (7875+12250)/2 = $10062.50
    expect(result.subtotalLow).toBe(11250);
    expect(result.subtotalHigh).toBe(17500);
    expect(result.totalLow).toBe(7875);
    expect(result.totalHigh).toBe(12250);
    expect(result.totalMid).toBe(10062.5);
  });

  // ─── Test 2: Without IRA tax credit ───
  it('calculates without IRA tax credit', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'no',
      electricalUpgrade: 'none',
      region: 'national',
    });
    expect(result.iraTaxCredit).toBe(0);
    // Total equals subtotal when no credit
    expect(result.totalLow).toBe(result.subtotalLow);
    expect(result.totalHigh).toBe(result.subtotalHigh);
    expect(result.totalMid).toBe(14375); // (11250+17500)/2
  });

  // ─── Test 3: IRA credit is exactly 30% of subtotal ───
  it('IRA credit is exactly 30% of subtotal', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'yes',
      electricalUpgrade: 'none',
      region: 'national',
    });
    const subtotalMid = ((result.subtotalLow as number) + (result.subtotalHigh as number)) / 2;
    expect(result.iraTaxCredit).toBeCloseTo(subtotalMid * 0.30, 1);
  });

  // ─── Test 4: Small 5 kWh battery ───
  it('calculates small 5 kWh battery correctly', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'small-5kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'yes',
      electricalUpgrade: 'none',
      region: 'national',
    });
    // Battery: $4000–$6000
    // Labor: 1000–1500
    // Subtotal: 5000–7500
    // IRA: 1500–2250
    // Total: 3500–5250
    expect(result.subtotalLow).toBe(5000);
    expect(result.subtotalHigh).toBe(7500);
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(5250);
  });

  // ─── Test 5: Medium 10 kWh battery ───
  it('calculates medium 10 kWh battery correctly', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'medium-10kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'yes',
      electricalUpgrade: 'none',
      region: 'national',
    });
    // Battery: $7000–$11000
    // Labor: 1750–2750
    // Subtotal: 8750–13750
    expect(result.subtotalLow).toBe(8750);
    expect(result.subtotalHigh).toBe(13750);
  });

  // ─── Test 6: Large 20 kWh battery ───
  it('calculates large 20 kWh battery correctly', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'large-20kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'no',
      electricalUpgrade: 'none',
      region: 'national',
    });
    // Battery: $13000–$20000
    // Labor: 3250–5000
    // Subtotal: 16250–25000
    expect(result.subtotalLow).toBe(16250);
    expect(result.subtotalHigh).toBe(25000);
  });

  // ─── Test 7: Whole-home 30 kWh battery ───
  it('calculates whole-home 30 kWh battery correctly', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'whole-home-30kwh',
      batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included',
      transferSwitch: 'none',
      claimIRATaxCredit: 'no',
      electricalUpgrade: 'none',
      region: 'national',
    });
    // Battery: $18000–$28000
    // Labor: 4500–7000
    // Subtotal: 22500–35000
    expect(result.subtotalLow).toBe(22500);
    expect(result.subtotalHigh).toBe(35000);
  });

  // ─── Test 8: LFP chemistry multiplier (1.10x) ───
  it('applies lithium iron phosphate chemistry multiplier (1.10x)', () => {
    const nmc = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const lfp = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-iron-phosphate',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    // LFP battery cost should be 10% higher
    expect((lfp.batteryCost as number)).toBeCloseTo((nmc.batteryCost as number) * 1.10, 0);
    expect((lfp.subtotalLow as number)).toBeGreaterThan((nmc.subtotalLow as number));
  });

  // ─── Test 9: Lead-acid chemistry multiplier (0.65x) ───
  it('applies lead-acid chemistry multiplier (0.65x)', () => {
    const nmc = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const leadAcid = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lead-acid',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    expect((leadAcid.batteryCost as number)).toBeCloseTo((nmc.batteryCost as number) * 0.65, 0);
    expect((leadAcid.subtotalLow as number)).toBeLessThan((nmc.subtotalLow as number));
  });

  // ─── Test 10: Separate inverter adder (+$1500-$3000) ───
  it('adds separate inverter cost', () => {
    const hybrid = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const separate = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'separate-inverter', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    expect(separate.inverterCost).toBe(2250); // (1500+3000)/2
    expect((separate.subtotalLow as number)).toBe((hybrid.subtotalLow as number) + 1500);
    expect((separate.subtotalHigh as number)).toBe((hybrid.subtotalHigh as number) + 3000);
  });

  // ─── Test 11: Existing compatible inverter ($0) ───
  it('existing compatible inverter adds no cost', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'existing-compatible', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    expect(result.inverterCost).toBe(0);
  });

  // ─── Test 12: Manual transfer switch (+$300-$600) ───
  it('adds manual transfer switch cost', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'manual',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    expect(result.transferSwitchCost).toBe(450); // (300+600)/2
  });

  // ─── Test 13: Automatic transfer switch (+$1000-$2500) ───
  it('adds automatic transfer switch cost', () => {
    const noSwitch = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const autoSwitch = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'automatic',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    expect(autoSwitch.transferSwitchCost).toBe(1750); // (1000+2500)/2
    expect((autoSwitch.subtotalLow as number)).toBe((noSwitch.subtotalLow as number) + 1000);
    expect((autoSwitch.subtotalHigh as number)).toBe((noSwitch.subtotalHigh as number) + 2500);
  });

  // ─── Test 14: Panel upgrade (+$1500-$3000) ───
  it('adds panel upgrade electrical cost', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'panel-upgrade', region: 'national',
    });
    expect(result.electricalCost).toBe(2250); // (1500+3000)/2
  });

  // ─── Test 15: Service upgrade (+$3000-$6000) ───
  it('adds service upgrade electrical cost', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'service-upgrade', region: 'national',
    });
    expect(result.electricalCost).toBe(4500); // (3000+6000)/2
  });

  // ─── Test 16: Northeast regional multiplier (1.20x on labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const northeast = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'northeast',
    });
    expect((northeast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.20, 0);
    expect((northeast.batteryCost as number)).toBe((national.batteryCost as number));
  });

  // ─── Test 17: South regional multiplier (0.85x on labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const south = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
  });

  // ─── Test 18: West Coast regional multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const westCoast = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'west-coast',
    });
    expect((westCoast.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.25, 0);
  });

  // ─── Test 19: Capacity comparison has all 5 sizes ───
  it('returns capacity comparison with all 5 battery sizes', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'yes', electricalUpgrade: 'none', region: 'national',
    });
    const comparison = result.capacityComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // 5 kWh should be cheapest, 30 kWh most expensive
    const small = comparison.find(c => c.label.includes('5 kWh'));
    const wholeHome = comparison.find(c => c.label.includes('30 kWh'));
    expect(small!.value).toBeLessThan(wholeHome!.value);
  });

  // ─── Test 20: IRA credit applies to all add-ons ───
  it('IRA credit applies to full subtotal including add-ons', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'separate-inverter', transferSwitch: 'automatic',
      claimIRATaxCredit: 'yes', electricalUpgrade: 'panel-upgrade', region: 'national',
    });
    // Subtotal includes inverter, switch, and electrical
    // IRA = subtotalMid × 0.30
    const subtotalMid = ((result.subtotalLow as number) + (result.subtotalHigh as number)) / 2;
    expect(result.iraTaxCredit).toBeCloseTo(subtotalMid * 0.30, 1);
    expect((result.totalMid as number)).toBeCloseTo(subtotalMid * 0.70, 1);
  });

  // ─── Test 21: Output structure has all expected fields ───
  it('returns all expected output fields', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'yes', electricalUpgrade: 'none', region: 'national',
    });
    expect(result).toHaveProperty('batteryCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('inverterCost');
    expect(result).toHaveProperty('transferSwitchCost');
    expect(result).toHaveProperty('electricalCost');
    expect(result).toHaveProperty('subtotalLow');
    expect(result).toHaveProperty('subtotalHigh');
    expect(result).toHaveProperty('subtotal');
    expect(result).toHaveProperty('iraTaxCredit');
    expect(result).toHaveProperty('totalAfterCredit');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('capacityComparison');
    expect(result).toHaveProperty('estimatedBackupHours');
    expect(result).toHaveProperty('paybackPeriod');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 22: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateSolarBatteryCost({});
    // Defaults: standard-13kwh, NMC, hybrid-included, none, IRA yes, none, national
    expect(result.subtotalLow).toBe(11250);
    expect(result.subtotalHigh).toBe(17500);
    expect((result.totalLow as number)).toBeLessThan((result.subtotalLow as number));
  });

  // ─── Test 23: Estimated backup hours by capacity ───
  it('returns correct backup hours for each capacity', () => {
    const small = calculateSolarBatteryCost({ batteryCapacity: 'small-5kwh' });
    const standard = calculateSolarBatteryCost({ batteryCapacity: 'standard-13kwh' });
    const wholeHome = calculateSolarBatteryCost({ batteryCapacity: 'whole-home-30kwh' });
    expect(small.estimatedBackupHours).toBe('4–6 hours (essential loads only)');
    expect(standard.estimatedBackupHours).toBe('10–14 hours (most circuits)');
    expect(wholeHome.estimatedBackupHours).toBe('20–30 hours (full home backup)');
  });

  // ─── Test 24: Timeline is 1-3 days ───
  it('returns installation timeline', () => {
    const result = calculateSolarBatteryCost({});
    expect(result.timeline).toBe('1–3 days');
  });

  // ─── Test 25: Lead-acid is cheapest, LFP is most expensive ───
  it('lead-acid is cheapest, LFP is most expensive of the three', () => {
    const nmc = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const lfp = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-iron-phosphate',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const lead = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lead-acid',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    expect((lead.totalMid as number)).toBeLessThan((nmc.totalMid as number));
    expect((nmc.totalMid as number)).toBeLessThan((lfp.totalMid as number));
  });

  // ─── Test 26: All add-ons combined ───
  it('handles all add-ons combined correctly', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'separate-inverter', transferSwitch: 'automatic',
      claimIRATaxCredit: 'no', electricalUpgrade: 'service-upgrade', region: 'national',
    });
    // Battery: $9000–$14000
    // Labor: $2250–$3500
    // Inverter: $1500–$3000
    // Transfer switch: $1000–$2500
    // Electrical: $3000–$6000
    // SubtotalLow: 9000+2250+1500+1000+3000 = $16750
    // SubtotalHigh: 14000+3500+3000+2500+6000 = $29000
    expect(result.subtotalLow).toBe(16750);
    expect(result.subtotalHigh).toBe(29000);
  });

  // ─── Test 27: Midwest regional multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const national = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const midwest = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'midwest',
    });
    expect((midwest.laborCost as number)).toBeCloseTo((national.laborCost as number) * 0.90, 0);
  });

  // ─── Test 28: Payback period varies by capacity ───
  it('returns correct payback period for each capacity', () => {
    const small = calculateSolarBatteryCost({ batteryCapacity: 'small-5kwh' });
    const large = calculateSolarBatteryCost({ batteryCapacity: 'large-20kwh' });
    expect(small.paybackPeriod).toBe('6–9 years with solar');
    expect(large.paybackPeriod).toBe('9–14 years with solar');
  });

  // ─── Test 29: Regional multiplier only affects labor, not battery ───
  it('regional multiplier changes labor but not battery cost', () => {
    const national = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'national',
    });
    const northeast = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'no', electricalUpgrade: 'none', region: 'northeast',
    });
    expect(national.batteryCost).toBe(northeast.batteryCost);
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 30: totalAfterCredit equals totalMid ───
  it('totalAfterCredit equals totalMid', () => {
    const result = calculateSolarBatteryCost({
      batteryCapacity: 'standard-13kwh', batteryChemistry: 'lithium-ion-nmc',
      inverterType: 'hybrid-included', transferSwitch: 'none',
      claimIRATaxCredit: 'yes', electricalUpgrade: 'none', region: 'national',
    });
    expect(result.totalAfterCredit).toBe(result.totalMid);
  });
});
