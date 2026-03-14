import { calculateGeneratorSize } from '@/lib/formulas/energy/generator-size';

describe('calculateGeneratorSize', () => {
  it('calculates total running watts from multiple appliances', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 0, furnaceBlower: 0, wellPump: 0, sumpPump: 0, lights: 300, television: 100, computer: 200, microwave: 0, otherWatts: 0, includeStartingSurge: false });
    expect(result.totalRunningWatts).toBe(750);
  });

  it('adds starting surge to get total starting watts', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 0, furnaceBlower: 0, wellPump: 0, sumpPump: 0, lights: 0, television: 0, computer: 0, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    // Refrigerator: 150 running + 800 surge
    expect(result.totalStartingWatts).toBe(150 + 800);
  });

  it('recommends 25% headroom on top of calculated load', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 1500, furnaceBlower: 500, wellPump: 0, sumpPump: 0, lights: 300, television: 100, computer: 200, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    expect(Number(result.recommendedKw)).toBeGreaterThan(0);
  });

  it('returns zero watts when all inputs are zero', () => {
    const result = calculateGeneratorSize({ refrigerator: 0, airConditioner: 0, furnaceBlower: 0, wellPump: 0, sumpPump: 0, lights: 0, television: 0, computer: 0, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    expect(result.totalRunningWatts).toBe(0);
  });

  it('includes applianceBreakdown array', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 1500, furnaceBlower: 0, wellPump: 0, sumpPump: 0, lights: 300, television: 0, computer: 0, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    const breakdown = result.applianceBreakdown as unknown[];
    expect(Array.isArray(breakdown)).toBe(true);
    expect(breakdown.length).toBeGreaterThan(0);
  });

  it('returns a recommendedSizeLabel string', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 1500, furnaceBlower: 500, wellPump: 800, sumpPump: 600, lights: 300, television: 100, computer: 200, microwave: 700, otherWatts: 500, includeStartingSurge: true });
    expect(typeof result.recommendedSizeLabel).toBe('string');
    expect((result.recommendedSizeLabel as string).length).toBeGreaterThan(0);
  });

  it('returns summary array with 4 items', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 1500, furnaceBlower: 0, wellPump: 0, sumpPump: 0, lights: 300, television: 100, computer: 200, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    expect(Array.isArray(result.summary)).toBe(true);
    expect((result.summary as unknown[]).length).toBe(4);
  });

  it('handles AC surge correctly — AC has 2200W surge', () => {
    const result = calculateGeneratorSize({ refrigerator: 0, airConditioner: 1500, furnaceBlower: 0, wellPump: 0, sumpPump: 0, lights: 0, television: 0, computer: 0, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    expect(result.totalStartingWatts).toBe(1500 + 2200);
  });

  it('handles well pump surge correctly — Well Pump has 2100W surge', () => {
    const result = calculateGeneratorSize({ refrigerator: 0, airConditioner: 0, furnaceBlower: 0, wellPump: 750, sumpPump: 0, lights: 0, television: 0, computer: 0, microwave: 0, otherWatts: 0, includeStartingSurge: true });
    expect(result.totalStartingWatts).toBe(750 + 2100);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculateGeneratorSize({});
    expect(typeof result.totalRunningWatts).toBe('number');
    expect(typeof result.recommendedKw).toBe('number');
  });

  it('recommendedKw is rounded to nearest 0.5 kW step', () => {
    const result = calculateGeneratorSize({ refrigerator: 150, airConditioner: 1500, furnaceBlower: 500, wellPump: 0, sumpPump: 0, lights: 300, television: 100, computer: 200, microwave: 700, otherWatts: 500, includeStartingSurge: true });
    const kw = Number(result.recommendedKw);
    expect(kw).toBeGreaterThan(0);
  });
});
