import { calculatePropaneTankRefill } from '@/lib/formulas/energy/propane-tank-refill';

describe('calculatePropaneTankRefill', () => {
  const defaults = { tankSize: '500gal', pricePerGallon: 2.80, refillsPerYear: 3, currentLevel: 20 };

  it('calculates gallons needed based on current level', () => {
    const result = calculatePropaneTankRefill(defaults);
    // 500 gal tank, 80% usable = 400, 80% of 400 needed = 320
    expect(result.gallonsNeeded).toBeCloseTo(320, 0);
  });

  it('calculates refill cost = gallons × price', () => {
    const result = calculatePropaneTankRefill(defaults);
    expect(Number(result.refillCost)).toBeCloseTo(320 * 2.80, 0);
  });

  it('annual cost = full refill × refills per year', () => {
    const result = calculatePropaneTankRefill(defaults);
    expect(Number(result.annualCost)).toBeCloseTo(Number(result.fullRefillCost) * 3, 0);
  });

  it('empty tank (0%) needs full usable capacity', () => {
    const result = calculatePropaneTankRefill({ ...defaults, currentLevel: 0 });
    expect(result.gallonsNeeded).toBe(400); // 80% of 500
  });

  it('full tank (100%) needs 0 gallons', () => {
    const result = calculatePropaneTankRefill({ ...defaults, currentLevel: 100 });
    expect(result.gallonsNeeded).toBe(0);
  });

  it('BBQ tank (20lb) is ~4 usable gallons', () => {
    const result = calculatePropaneTankRefill({ tankSize: '20lb', pricePerGallon: 4.50, currentLevel: 0, refillsPerYear: 6 });
    expect(result.gallonsNeeded).toBeCloseTo(4, 0);
    expect(Number(result.refillCost)).toBeCloseTo(18, 0);
  });

  it('bulk discount applies to 200+ gallon tanks', () => {
    const result = calculatePropaneTankRefill({ ...defaults, tankSize: '500gal' });
    expect(Number(result.bulkDiscount)).toBe(0.20);
    expect(Number(result.bulkSavings)).toBeGreaterThan(0);
  });

  it('no bulk discount for small tanks', () => {
    const result = calculatePropaneTankRefill({ tankSize: '20lb', pricePerGallon: 4.50, currentLevel: 0, refillsPerYear: 6 });
    expect(result.bulkDiscount).toBe(0);
  });

  it('higher price = higher cost', () => {
    const cheap = calculatePropaneTankRefill({ ...defaults, pricePerGallon: 2.00 });
    const expensive = calculatePropaneTankRefill({ ...defaults, pricePerGallon: 4.00 });
    expect(Number(expensive.refillCost)).toBeGreaterThan(Number(cheap.refillCost));
  });

  it('handles missing inputs with defaults', () => {
    const result = calculatePropaneTankRefill({});
    expect(typeof result.refillCost).toBe('number');
    expect(Number(result.refillCost)).toBeGreaterThan(0);
  });

  it('returns tank label', () => {
    const result = calculatePropaneTankRefill({ tankSize: '250gal' });
    expect(result.tankLabel).toBe('250 gallon');
  });
});
