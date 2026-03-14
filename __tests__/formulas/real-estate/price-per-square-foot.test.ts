import { calculatePricePerSqFt } from '@/lib/formulas/real-estate/price-per-square-foot';

describe('calculatePricePerSqFt', () => {
  it('calculates subject PSF correctly', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 0, comp1SqFt: 1, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    expect(result.subjectPSF).toBe(200);
  });

  it('calculates average comp PSF from one comparable', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 380000, comp1SqFt: 1900, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    expect(Number(result.avgCompPSF)).toBeCloseTo(380000 / 1900, 2);
  });

  it('calculates average comp PSF from three comparables', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 300000, comp1SqFt: 1500, comp2Price: 400000, comp2SqFt: 2000, comp3Price: 500000, comp3SqFt: 2500 });
    const avgPSF = (200 + 200 + 200) / 3;
    expect(Number(result.avgCompPSF)).toBeCloseTo(avgPSF, 2);
  });

  it('calculates estimated value from avg comp PSF', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 300000, comp1SqFt: 1500, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    const compPSF = 300000 / 1500;
    expect(Number(result.estimatedValue)).toBeCloseTo(compPSF * 2000, 0);
  });

  it('returns premium when subject PSF is above comps', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 500000, squareFootage: 2000, comp1Price: 400000, comp1SqFt: 2000, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    expect(Number(result.premiumDiscountPercent)).toBeGreaterThan(0);
  });

  it('returns discount when subject PSF is below comps', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 300000, squareFootage: 2000, comp1Price: 400000, comp1SqFt: 2000, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    expect(Number(result.premiumDiscountPercent)).toBeLessThan(0);
  });

  it('returns zero avgCompPSF when no comps provided', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 0, comp1SqFt: 1, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    expect(result.avgCompPSF).toBe(0);
    expect(result.estimatedValue).toBe(0);
    expect(result.premiumDiscountPercent).toBe(0);
  });

  it('handles typical urban condo PSF scenario', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 750000, squareFootage: 1200, comp1Price: 700000, comp1SqFt: 1100, comp2Price: 800000, comp2SqFt: 1300, comp3Price: 680000, comp3SqFt: 1050 });
    expect(Number(result.subjectPSF)).toBeCloseTo(750000 / 1200, 2);
    expect(Number(result.avgCompPSF)).toBeGreaterThan(0);
  });

  it('comparablesTable includes subject property row', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 380000, comp1SqFt: 1900, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    const table = result.comparablesTable as { label: string }[];
    const hasSubject = table.some(r => r.label === 'Subject Property');
    expect(hasSubject).toBe(true);
  });

  it('returns summary array', () => {
    const result = calculatePricePerSqFt({ propertyPrice: 400000, squareFootage: 2000, comp1Price: 380000, comp1SqFt: 1900, comp2Price: 0, comp2SqFt: 1, comp3Price: 0, comp3SqFt: 1 });
    expect(Array.isArray(result.summary)).toBe(true);
  });

  it('handles missing inputs gracefully', () => {
    const result = calculatePricePerSqFt({});
    expect(typeof result.subjectPSF).toBe('number');
  });
});
