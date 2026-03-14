import { calculateFBAStorageFee } from '@/lib/formulas/ecommerce/amazon-fba-storage-fee';

describe('calculateFBAStorageFee', () => {
  const base = {
    cubicFeetPerUnit: 0.5,
    unitsStored: 500,
    sizeType: 'standard',
    storagePeriod: 'regular',
    daysAged: 90,
    unitCost: 8,
  };

  it('calculates monthly storage fee correctly for standard regular period', () => {
    const result = calculateFBAStorageFee(base);
    // 0.5 × 500 = 250 cuft × $0.78 = $195
    expect(result.monthlyStorageFee).toBeCloseTo(195, 1);
  });

  it('Q4 peak rate is higher than regular for standard size', () => {
    const regular = calculateFBAStorageFee(base);
    const peak = calculateFBAStorageFee({ ...base, storagePeriod: 'peak' });
    expect(peak.monthlyStorageFee).toBeGreaterThan(regular.monthlyStorageFee as number);
  });

  it('peak rate for standard = $2.40/cuft (vs $0.78 regular)', () => {
    const peak = calculateFBAStorageFee({ ...base, storagePeriod: 'peak' });
    // 250 cuft × $2.40 = $600
    expect(peak.monthlyStorageFee).toBeCloseTo(600, 1);
  });

  it('oversize has lower rate than standard', () => {
    const standard = calculateFBAStorageFee(base);
    const oversize = calculateFBAStorageFee({ ...base, sizeType: 'oversize' });
    // oversize regular = $0.56 vs standard $0.78
    expect(oversize.monthlyStorageFee).toBeLessThan(standard.monthlyStorageFee as number);
  });

  it('aged inventory surcharge is 0 when days < 271', () => {
    const result = calculateFBAStorageFee({ ...base, daysAged: 180 });
    expect(result.agedInventorySurcharge).toBe(0);
  });

  it('aged inventory surcharge applies at 271+ days ($0.50/cuft)', () => {
    const result = calculateFBAStorageFee({ ...base, daysAged: 300 });
    // 250 cuft × $0.50 = $125
    expect(result.agedInventorySurcharge).toBeCloseTo(125, 1);
  });

  it('long-term storage surcharge ($6.90/cuft) applies at 365+ days', () => {
    const result = calculateFBAStorageFee({ ...base, daysAged: 400 });
    // 250 cuft × $6.90 = $1,725
    expect(result.agedInventorySurcharge).toBeCloseTo(1725, 1);
  });

  it('storage fee per unit is monthly fee divided by units', () => {
    const result = calculateFBAStorageFee(base);
    expect(result.storageFeePerUnit).toBeCloseTo((result.monthlyStorageFee as number) / 500, 3);
  });

  it('annual cost is approximately 9× regular + 3× peak', () => {
    const result = calculateFBAStorageFee(base);
    // regular: 250 × 0.78 × 9 = $1,755; peak: 250 × 2.40 × 3 = $1,800; total = $3,555
    expect(result.annualStorageCost).toBeCloseTo(3555, 0);
  });

  it('capital tied up equals units × unit cost', () => {
    const result = calculateFBAStorageFee(base);
    expect(result.capitalTiedUp).toBeCloseTo(500 * 8, 2);
  });

  it('summary has 6 entries', () => {
    const result = calculateFBAStorageFee(base);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('more units stored increases monthly fee proportionally', () => {
    const small = calculateFBAStorageFee({ ...base, unitsStored: 100 });
    const large = calculateFBAStorageFee({ ...base, unitsStored: 1000 });
    expect(large.monthlyStorageFee).toBeCloseTo((small.monthlyStorageFee as number) * 10, 1);
  });
});
