import {
  calculateElectricBill,
  zipToStateCode,
  getStateRate,
  STATE_RATES,
  NATIONAL_AVG,
  HOUSEHOLD_PRESETS,
} from '@/lib/formulas/energy/electric-bill-calculator';

// ─── Core Calculation Tests ─────────────────────────────────

describe('calculateElectricBill', () => {
  it('calculates monthly bill at national average (863 kWh, $0.1724/kWh, $12 base fee)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    expect(result.monthlyBill).toBeCloseTo(160.78, 0);
  });

  it('calculates annual bill as monthly × 12', () => {
    const result = calculateElectricBill({ monthlyKwh: 1000, ratePerKwh: 0.15, monthlyBaseFee: 10 });
    const expectedMonthly = 1000 * 0.15 + 10;
    expect(result.annualBill).toBeCloseTo(expectedMonthly * 12, 1);
  });

  it('calculates daily cost as monthly / 30', () => {
    const result = calculateElectricBill({ monthlyKwh: 900, ratePerKwh: 0.20, monthlyBaseFee: 15 });
    const expectedMonthly = 900 * 0.20 + 15;
    expect(result.dailyCost).toBeCloseTo(expectedMonthly / 30, 1);
  });

  it('handles zero kWh usage', () => {
    const result = calculateElectricBill({ monthlyKwh: 0, ratePerKwh: 0.16, monthlyBaseFee: 12 });
    expect(result.monthlyBill).toBe(12);
    expect(result.energyCost).toBe(0);
  });

  it('handles zero base fee', () => {
    const result = calculateElectricBill({ monthlyKwh: 500, ratePerKwh: 0.10, monthlyBaseFee: 0 });
    expect(result.monthlyBill).toBe(50);
  });

  it('calculates Hawaii high-rate scenario ($0.4162/kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.4162, monthlyBaseFee: 20 });
    expect(result.monthlyBill).toBeCloseTo(379.18, 0);
  });

  it('calculates North Dakota low-rate scenario ($0.1102/kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1102, monthlyBaseFee: 8 });
    expect(result.monthlyBill).toBeCloseTo(103.10, 0);
  });

  it('handles high usage (2000 kWh) at California rate', () => {
    const result = calculateElectricBill({ monthlyKwh: 2000, ratePerKwh: 0.3471, monthlyBaseFee: 15 });
    expect(result.monthlyBill).toBeCloseTo(709.20, 0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateElectricBill({});
    expect(typeof result.monthlyBill).toBe('number');
    expect(Number(result.monthlyBill)).toBeGreaterThan(0);
  });

  it('handles negative inputs by clamping to zero', () => {
    const result = calculateElectricBill({ monthlyKwh: -100, ratePerKwh: -0.10, monthlyBaseFee: -5 });
    expect(Number(result.monthlyBill)).toBe(0);
  });

  it('handles very small usage (1 kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 1, ratePerKwh: 0.16, monthlyBaseFee: 0 });
    expect(result.monthlyBill).toBeCloseTo(0.16, 2);
  });

  it('returns breakdown array with 5 items', () => {
    const result = calculateElectricBill({ monthlyKwh: 500, ratePerKwh: 0.16, monthlyBaseFee: 10 });
    expect(Array.isArray(result.breakdown)).toBe(true);
    expect((result.breakdown as unknown[]).length).toBe(5);
  });

  it('correctly separates energy cost from base fee', () => {
    const result = calculateElectricBill({ monthlyKwh: 1000, ratePerKwh: 0.20, monthlyBaseFee: 15 });
    expect(result.energyCost).toBe(200);
    expect(result.baseFee).toBe(15);
    expect(result.monthlyBill).toBe(215);
  });

  it('handles apartment preset (500 kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 500, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    expect(result.monthlyBill).toBeCloseTo(98.20, 0);
  });

  it('handles large home preset (1500 kWh)', () => {
    const result = calculateElectricBill({ monthlyKwh: 1500, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    expect(result.monthlyBill).toBeCloseTo(270.60, 0);
  });
});

// ─── Appliance Breakdown Tests ──────────────────────────────

describe('appliance breakdown', () => {
  it('returns 5 appliance categories', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    const breakdown = result.applianceBreakdown as Array<{ label: string; percentage: number; monthlyCost: number; monthlyKwh: number }>;
    expect(breakdown.length).toBe(5);
  });

  it('appliance percentages sum to 100%', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    const breakdown = result.applianceBreakdown as Array<{ percentage: number }>;
    const total = breakdown.reduce((sum, a) => sum + a.percentage, 0);
    expect(total).toBeCloseTo(100, 0);
  });

  it('appliance costs sum to energy cost (excluding base fee)', () => {
    const result = calculateElectricBill({ monthlyKwh: 1000, ratePerKwh: 0.20, monthlyBaseFee: 10 });
    const breakdown = result.applianceBreakdown as Array<{ monthlyCost: number }>;
    const totalAppCost = breakdown.reduce((sum, a) => sum + a.monthlyCost, 0);
    // Should approximately equal energy cost (200), allow rounding
    expect(totalAppCost).toBeCloseTo(200, 0);
  });

  it('HVAC is the largest share (46%)', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    const breakdown = result.applianceBreakdown as Array<{ label: string; percentage: number }>;
    const hvac = breakdown.find(a => a.label.includes('HVAC'));
    expect(hvac).toBeDefined();
    expect(hvac!.percentage).toBe(46);
  });

  it('appliance kWh values sum to total monthly kWh', () => {
    const monthlyKwh = 1000;
    const result = calculateElectricBill({ monthlyKwh, ratePerKwh: 0.15, monthlyBaseFee: 10 });
    const breakdown = result.applianceBreakdown as Array<{ monthlyKwh: number }>;
    const totalKwh = breakdown.reduce((sum, a) => sum + a.monthlyKwh, 0);
    expect(totalKwh).toBeCloseTo(monthlyKwh, 0);
  });
});

// ─── Efficiency Comparison Tests ────────────────────────────

describe('efficiency comparison', () => {
  it('rates average bill as "About Average"', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 0 });
    const eff = result.efficiency as { rating: string; ratingLabel: string };
    expect(eff.rating).toBe('average');
    expect(eff.ratingLabel).toBe('About Average');
  });

  it('rates low bill as "Well Below Average"', () => {
    const result = calculateElectricBill({ monthlyKwh: 300, ratePerKwh: 0.10, monthlyBaseFee: 0 });
    const eff = result.efficiency as { rating: string };
    expect(eff.rating).toBe('low');
  });

  it('rates high bill as "Well Above Average"', () => {
    const result = calculateElectricBill({ monthlyKwh: 2000, ratePerKwh: 0.35, monthlyBaseFee: 20 });
    const eff = result.efficiency as { rating: string };
    expect(eff.rating).toBe('high');
  });

  it('calculates correct percent difference from national average', () => {
    const bill = 200;
    const expectedPct = ((bill - NATIONAL_AVG.monthlyBill) / NATIONAL_AVG.monthlyBill) * 100;
    // Force a ~$200 bill
    const result = calculateElectricBill({ monthlyKwh: 1000, ratePerKwh: 0.188, monthlyBaseFee: 12 });
    const eff = result.efficiency as { percentVsNational: number };
    expect(eff.percentVsNational).toBeCloseTo(expectedPct, -1);
  });

  it('efficiency meter position is between 0 and 100', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    const eff = result.efficiency as { meterPosition: number };
    expect(eff.meterPosition).toBeGreaterThanOrEqual(0);
    expect(eff.meterPosition).toBeLessThanOrEqual(100);
  });
});

// ─── State Info Tests ───────────────────────────────────────

describe('state information', () => {
  it('returns null stateInfo when no state provided', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12 });
    expect(result.stateInfo).toBeNull();
  });

  it('returns state info when valid state code provided', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12, stateCode: 'TX' });
    const info = result.stateInfo as { stateCode: string; stateName: string };
    expect(info).not.toBeNull();
    expect(info.stateCode).toBe('TX');
    expect(info.stateName).toBe('Texas');
  });

  it('calculates rate vs state comparison', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.20, monthlyBaseFee: 12, stateCode: 'TX' });
    const info = result.stateInfo as { rateVsState: number; stateAvgRate: number };
    expect(info.stateAvgRate).toBeCloseTo(0.1587, 3);
    expect(info.rateVsState).toBeGreaterThan(0); // 0.20 > 0.1587
  });

  it('handles invalid state code gracefully', () => {
    const result = calculateElectricBill({ monthlyKwh: 863, ratePerKwh: 0.1724, monthlyBaseFee: 12, stateCode: 'XX' });
    expect(result.stateInfo).toBeNull();
  });
});

// ─── ZIP Code Tests ─────────────────────────────────────────

describe('zipToStateCode', () => {
  it('maps New York ZIP to NY', () => {
    expect(zipToStateCode('10001')).toBe('NY');
  });

  it('maps Los Angeles ZIP to CA', () => {
    expect(zipToStateCode('90210')).toBe('CA');
  });

  it('maps Houston ZIP to TX', () => {
    expect(zipToStateCode('77001')).toBe('TX');
  });

  it('maps Chicago ZIP to IL', () => {
    expect(zipToStateCode('60601')).toBe('IL');
  });

  it('maps Honolulu ZIP to HI', () => {
    expect(zipToStateCode('96801')).toBe('HI');
  });

  it('maps Fargo ZIP to ND', () => {
    expect(zipToStateCode('58102')).toBe('ND');
  });

  it('returns null for invalid ZIP', () => {
    expect(zipToStateCode('')).toBeNull();
    expect(zipToStateCode('00')).toBeNull();
  });

  it('handles ZIP with spaces', () => {
    expect(zipToStateCode('1 0 0 0 1')).toBe('NY');
  });

  it('handles ZIP with dashes', () => {
    expect(zipToStateCode('10001-1234')).toBe('NY');
  });
});

// ─── getStateRate Tests ─────────────────────────────────────

describe('getStateRate', () => {
  it('returns rate data for valid state code', () => {
    const rate = getStateRate('CA');
    expect(rate).not.toBeNull();
    expect(rate!.stateName).toBe('California');
    expect(rate!.avgRateCentsPerKwh).toBe(34.71);
  });

  it('returns null for invalid state code', () => {
    expect(getStateRate('XX')).toBeNull();
  });

  it('is case-insensitive', () => {
    const rate = getStateRate('ca');
    expect(rate).not.toBeNull();
    expect(rate!.stateCode).toBe('CA');
  });

  it('has data for all 50 states + DC', () => {
    expect(STATE_RATES.length).toBe(51);
  });
});

// ─── Household Presets Tests ────────────────────────────────

describe('household presets', () => {
  it('apartment preset is 500 kWh', () => {
    const apt = HOUSEHOLD_PRESETS.find(p => p.id === 'apartment');
    expect(apt).toBeDefined();
    expect(apt!.kWh).toBe(500);
  });

  it('small home preset is 900 kWh', () => {
    const home = HOUSEHOLD_PRESETS.find(p => p.id === 'small-home');
    expect(home).toBeDefined();
    expect(home!.kWh).toBe(900);
  });

  it('large home preset is 1500 kWh', () => {
    const large = HOUSEHOLD_PRESETS.find(p => p.id === 'large-home');
    expect(large).toBeDefined();
    expect(large!.kWh).toBe(1500);
  });

  it('has exactly 3 presets', () => {
    expect(HOUSEHOLD_PRESETS.length).toBe(3);
  });
});

// ─── National Average Constants ─────────────────────────────

describe('national averages', () => {
  it('national average rate is $0.1724/kWh', () => {
    expect(NATIONAL_AVG.ratePerKwh).toBe(0.1724);
  });

  it('national average usage is 863 kWh/month', () => {
    expect(NATIONAL_AVG.monthlyKwh).toBe(863);
  });

  it('national average bill is $148.78/month', () => {
    expect(NATIONAL_AVG.monthlyBill).toBe(148.78);
  });
});
