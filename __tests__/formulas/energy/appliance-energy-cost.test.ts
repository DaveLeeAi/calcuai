import { calculateApplianceEnergyCost } from '@/lib/formulas/energy/appliance-energy-cost';

describe('calculateApplianceEnergyCost', () => {
  it('calculates refrigerator annual cost (150W, 24h/day)', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'refrigerator', ratePerKwh: 0.1724 });
    // 150 × 24 × 365 / 1000 = 1314 kWh × $0.1724 = ~$226
    expect(Number(result.annualCost)).toBeCloseTo(226, -1);
  });

  it('calculates clothes dryer cost (5000W, 1h/day)', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'clothes-dryer', ratePerKwh: 0.16 });
    // 5000 × 1 × 365 / 1000 = 1825 kWh × $0.16 = $292
    expect(Number(result.annualCost)).toBeCloseTo(292, 0);
  });

  it('uses preset wattage for known appliance', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'space-heater' });
    expect(result.presetWatts).toBe(1500);
  });

  it('allows custom wattage override', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'custom', watts: 2000, hoursPerDay: 3, ratePerKwh: 0.15 });
    expect(Number(result.dailyKwh)).toBeCloseTo(6, 1);
  });

  it('handles quantity > 1', () => {
    const one = calculateApplianceEnergyCost({ appliance: 'led-bulb', quantity: 1, ratePerKwh: 0.16 });
    const ten = calculateApplianceEnergyCost({ appliance: 'led-bulb', quantity: 10, ratePerKwh: 0.16 });
    expect(Number(ten.annualCost)).toBeCloseTo(Number(one.annualCost) * 10, 0);
  });

  it('returns appliance comparison list sorted by cost', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'refrigerator', ratePerKwh: 0.16 });
    const list = result.applianceList as { annualCost: number }[];
    expect(list.length).toBeGreaterThan(10);
    expect(list[0].annualCost).toBeGreaterThanOrEqual(list[1].annualCost);
  });

  it('handles seasonal usage (daysPerYear < 365)', () => {
    const full = calculateApplianceEnergyCost({ appliance: 'window-ac', daysPerYear: 365, ratePerKwh: 0.16 });
    const summer = calculateApplianceEnergyCost({ appliance: 'window-ac', daysPerYear: 90, ratePerKwh: 0.16 });
    expect(Number(summer.annualCost)).toBeLessThan(Number(full.annualCost));
  });

  it('handles zero watts', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'custom', watts: 0, hoursPerDay: 8, ratePerKwh: 0.16 });
    expect(result.annualCost).toBe(0);
  });

  it('monthly cost = annual / 12', () => {
    const result = calculateApplianceEnergyCost({ appliance: 'central-ac', ratePerKwh: 0.16 });
    expect(Number(result.monthlyCost)).toBeCloseTo(Number(result.annualCost) / 12, 0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateApplianceEnergyCost({});
    expect(typeof result.annualCost).toBe('number');
    expect(Number(result.annualCost)).toBeGreaterThan(0);
  });
});
