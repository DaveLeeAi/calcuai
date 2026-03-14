import { calculateEnergyAuditRoi } from '@/lib/formulas/energy/energy-audit-roi';

describe('calculateEnergyAuditRoi', () => {
  const defaults = { annualEnergyBill: 2400, auditCost: 400 };

  it('calculates positive annual savings with default improvements', () => {
    const result = calculateEnergyAuditRoi(defaults);
    expect(Number(result.annualSavings)).toBeGreaterThan(500);
  });

  it('total cost includes audit + improvement costs', () => {
    const result = calculateEnergyAuditRoi(defaults);
    expect(Number(result.totalCost)).toBeGreaterThan(400);
    expect(Number(result.totalCost)).toBe(Number(result.totalImprovementCost) + 400);
  });

  it('caps combined savings at 50% of bill', () => {
    // Select ALL improvements to exceed 50%
    const allImprovements = 'air-sealing,insulation,duct-sealing,hvac-tuneup,water-heater,windows,smart-thermostat,lighting';
    const result = calculateEnergyAuditRoi({ ...defaults, improvements: allImprovements });
    expect(Number(result.effectiveSavingsPct)).toBeLessThanOrEqual(50);
    expect(Number(result.annualSavings)).toBeLessThanOrEqual(2400 * 0.5);
  });

  it('fewer improvements means less savings', () => {
    const few = calculateEnergyAuditRoi({ ...defaults, improvements: 'air-sealing,lighting' });
    const many = calculateEnergyAuditRoi({ ...defaults, improvements: 'air-sealing,insulation,duct-sealing,hvac-tuneup,smart-thermostat,lighting' });
    expect(Number(few.annualSavings)).toBeLessThan(Number(many.annualSavings));
  });

  it('calculates payback period', () => {
    const result = calculateEnergyAuditRoi(defaults);
    expect(Number(result.paybackYears)).toBeGreaterThan(0);
  });

  it('10-year and 20-year net savings are positive for reasonable inputs', () => {
    const result = calculateEnergyAuditRoi(defaults);
    expect(Number(result.tenYearNet)).toBeGreaterThan(0);
    expect(Number(result.twentyYearNet)).toBeGreaterThan(Number(result.tenYearNet));
  });

  it('returns improvement breakdown', () => {
    const result = calculateEnergyAuditRoi(defaults);
    const breakdown = result.breakdown as unknown[];
    expect(breakdown.length).toBeGreaterThan(0);
  });

  it('higher annual bill = higher savings', () => {
    const low = calculateEnergyAuditRoi({ ...defaults, annualEnergyBill: 1200 });
    const high = calculateEnergyAuditRoi({ ...defaults, annualEnergyBill: 4800 });
    expect(Number(high.annualSavings)).toBeGreaterThan(Number(low.annualSavings));
  });

  it('handles single improvement', () => {
    const result = calculateEnergyAuditRoi({ ...defaults, improvements: 'air-sealing' });
    expect(Number(result.annualSavings)).toBeCloseTo(2400 * 0.15, 0);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateEnergyAuditRoi({});
    expect(typeof result.annualSavings).toBe('number');
    expect(Number(result.annualSavings)).toBeGreaterThan(0);
  });
});
