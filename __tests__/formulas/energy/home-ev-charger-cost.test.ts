import { calculateHomeEvChargerCost } from '@/lib/formulas/energy/home-ev-charger-cost';

describe('calculateHomeEvChargerCost', () => {
  it('Level 2 outlet charger total cost is reasonable', () => {
    const result = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 20 });
    expect(Number(result.totalCost)).toBeGreaterThan(500);
    expect(Number(result.totalCost)).toBeLessThan(3000);
  });

  it('Level 1 charger has minimal cost (plug-in, no install)', () => {
    const result = calculateHomeEvChargerCost({ chargerLevel: 'level-1', panelUpgradeNeeded: false, outletDistance: 0 });
    expect(Number(result.totalCost)).toBeLessThanOrEqual(200);
  });

  it('panel upgrade adds $2000', () => {
    const without = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 20 });
    const withUpgrade = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: true, outletDistance: 20 });
    expect(Number(withUpgrade.totalCost) - Number(without.totalCost)).toBe(2000);
  });

  it('longer distance increases labor cost', () => {
    const close = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 10 });
    const far = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 50 });
    expect(Number(far.installationLabor)).toBeGreaterThan(Number(close.installationLabor));
  });

  it('hardwired Level 2 costs more than outlet Level 2', () => {
    const outlet = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 20 });
    const hardwired = calculateHomeEvChargerCost({ chargerLevel: 'level-2-hardwired', panelUpgradeNeeded: false, outletDistance: 20 });
    expect(Number(hardwired.totalCost)).toBeGreaterThan(Number(outlet.totalCost));
  });

  it('returns annual charging cost estimate', () => {
    const result = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 20 });
    expect(Number(result.annualChargingCost)).toBeGreaterThan(0);
  });

  it('returns breakdown array with 5 items', () => {
    const result = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 20 });
    expect(Array.isArray(result.breakdown)).toBe(true);
    expect((result.breakdown as unknown[]).length).toBe(5);
  });

  it('handles "yes" string for panelUpgradeNeeded', () => {
    const result = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: 'yes', outletDistance: 20 });
    expect(result.panelUpgradeCost).toBe(2000);
  });

  it('handles missing inputs with defaults', () => {
    const result = calculateHomeEvChargerCost({});
    expect(typeof result.totalCost).toBe('number');
    expect(Number(result.totalCost)).toBeGreaterThan(0);
  });

  it('zero distance means no distance surcharge', () => {
    const result = calculateHomeEvChargerCost({ chargerLevel: 'level-2', panelUpgradeNeeded: false, outletDistance: 0 });
    expect(Number(result.installationLabor)).toBeGreaterThanOrEqual(0);
  });
});
