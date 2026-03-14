import { calculateEnergyRebate } from '@/lib/formulas/energy/energy-rebate';

describe('calculateEnergyRebate', () => {
  it('low income (≤80% AMI) gets max HEAR rebate for heat pump', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 50000, areaMedianIncome: 80000, projectCost: 15000, stateRebate: 0 });
    expect(result.hearRebate).toBe(8000);
  });

  it('moderate income (80-150% AMI) gets 50% HEAR rebate', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 80000, areaMedianIncome: 80000, projectCost: 15000, stateRebate: 0 });
    expect(result.hearRebate).toBe(4000); // 50% of $8000
  });

  it('high income (>150% AMI) gets $0 HEAR rebate', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 150000, areaMedianIncome: 80000, projectCost: 15000, stateRebate: 0 });
    expect(result.hearRebate).toBe(0);
  });

  it('low income gets max HOMES rebate ($8000)', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 50000, areaMedianIncome: 80000, projectCost: 15000, stateRebate: 0 });
    expect(result.homesRebate).toBe(8000);
  });

  it('federal 25C credit is 30% up to $2000 for heat pump', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 50000, areaMedianIncome: 80000, projectCost: 15000, stateRebate: 0 });
    expect(result.federal25C).toBe(2000);
  });

  it('solar gets 30% ITC with no cap', () => {
    const result = calculateEnergyRebate({ projectType: 'solar', householdIncome: 100000, areaMedianIncome: 80000, projectCost: 30000, stateRebate: 0 });
    expect(result.federal25C).toBe(9000);
  });

  it('net cost is never negative', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 40000, areaMedianIncome: 80000, projectCost: 5000, stateRebate: 5000 });
    expect(Number(result.netCost)).toBeGreaterThanOrEqual(0);
  });

  it('includes state rebate in total', () => {
    const result = calculateEnergyRebate({ projectType: 'heat-pump', householdIncome: 50000, areaMedianIncome: 80000, projectCost: 15000, stateRebate: 2000 });
    expect(Number(result.totalRebate)).toBeGreaterThanOrEqual(Number(result.hearRebate) + 2000);
  });

  it('windows project has lower HEAR cap ($2500)', () => {
    const result = calculateEnergyRebate({ projectType: 'windows', householdIncome: 50000, areaMedianIncome: 80000, projectCost: 10000, stateRebate: 0 });
    expect(Number(result.hearRebate)).toBeLessThanOrEqual(2500);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateEnergyRebate({});
    expect(typeof result.totalRebate).toBe('number');
    expect(typeof result.netCost).toBe('number');
  });

  it('EV charger gets $0 HEAR but $1000 federal credit', () => {
    const result = calculateEnergyRebate({ projectType: 'ev-charger', householdIncome: 50000, areaMedianIncome: 80000, projectCost: 5000, stateRebate: 0 });
    expect(result.hearRebate).toBe(0);
    expect(result.federal25C).toBe(1000);
  });
});
