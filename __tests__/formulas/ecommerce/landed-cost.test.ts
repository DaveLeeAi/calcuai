import { calculateLandedCost } from '@/lib/formulas/ecommerce/landed-cost';

describe('calculateLandedCost', () => {
  const base = {
    fobCostPerUnit: 8,
    unitsPerShipment: 500,
    totalFreightCost: 1800,
    freightInsurance: 120,
    importDutyRate: 15,
    customsBrokerFee: 250,
    inlandFreight: 400,
    otherFees: 150,
  };

  it('calculates landed cost per unit correctly', () => {
    const result = calculateLandedCost(base);
    // FOB total = 8 × 500 = 4000
    // Duty = 4000 × 0.15 = 600
    // Total = 4000 + 1800 + 120 + 600 + 250 + 400 + 150 = 7320
    // Per unit = 7320 / 500 = 14.64
    expect(result.landedCostPerUnit).toBeCloseTo(14.64, 1);
  });

  it('calculates landed cost markup vs FOB', () => {
    const result = calculateLandedCost(base);
    // markup = (14.64 / 8 - 1) × 100 = 83%
    expect(result.landedCostMarkupPct).toBeCloseTo(83, 0);
  });

  it('calculates total duty paid', () => {
    const result = calculateLandedCost(base);
    // duty = 4000 × 0.15 = 600
    expect(result.totalDutyPaid).toBeCloseTo(600, 0);
  });

  it('zero duty rate results in zero duty paid', () => {
    const result = calculateLandedCost({ ...base, importDutyRate: 0 });
    expect(result.totalDutyPaid).toBe(0);
  });

  it('higher duty rate increases landed cost', () => {
    const low = calculateLandedCost({ ...base, importDutyRate: 10 });
    const high = calculateLandedCost({ ...base, importDutyRate: 30 });
    expect(high.landedCostPerUnit).toBeGreaterThan(low.landedCostPerUnit as number);
  });

  it('more units per shipment lowers per-unit freight cost', () => {
    const small = calculateLandedCost({ ...base, unitsPerShipment: 100 });
    const large = calculateLandedCost({ ...base, unitsPerShipment: 2000 });
    expect(large.landedCostPerUnit).toBeLessThan(small.landedCostPerUnit as number);
  });

  it('cost breakdown table has 7 rows', () => {
    const result = calculateLandedCost(base);
    expect((result.costBreakdownTable as unknown[]).length).toBe(7);
  });

  it('sum of breakdown row totals equals total landed cost', () => {
    const result = calculateLandedCost(base);
    const table = result.costBreakdownTable as { total: number }[];
    const sum = table.reduce((acc, r) => acc + r.total, 0);
    const totalPerUnit = result.landedCostPerUnit as number;
    const units = base.unitsPerShipment;
    expect(sum).toBeCloseTo(totalPerUnit * units, 0);
  });

  it('landed cost markup is 0% when no fees beyond FOB', () => {
    const result = calculateLandedCost({
      fobCostPerUnit: 10,
      unitsPerShipment: 100,
      totalFreightCost: 0,
      freightInsurance: 0,
      importDutyRate: 0,
      customsBrokerFee: 0,
      inlandFreight: 0,
      otherFees: 0,
    });
    expect(result.landedCostMarkupPct).toBeCloseTo(0, 1);
    expect(result.landedCostPerUnit).toBeCloseTo(10, 2);
  });

  it('China 30% duty scenario: $8 FOB becomes $9.60+ per unit', () => {
    const result = calculateLandedCost({ ...base, importDutyRate: 30 });
    // duty alone adds $2.40/unit ($8 × 0.30) on top of $8 FOB
    expect(result.landedCostPerUnit).toBeGreaterThan(10.40);
  });

  it('summary has 6 entries', () => {
    const result = calculateLandedCost(base);
    expect((result.summary as unknown[]).length).toBe(6);
  });
});
