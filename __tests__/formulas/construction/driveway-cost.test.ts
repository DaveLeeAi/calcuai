import { calculateDrivewayCost } from '@/lib/formulas/construction/driveway-cost';

describe('calculateDrivewayCost', () => {
  // ─── Test 1: Standard concrete driveway 40×12 ───
  it('calculates a standard 40×12 concrete driveway', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    // Area = 480 sq ft
    // Concrete: $6-$12/sq ft, new-install 1.0x, flat +$0
    // Low: 480 × 6 × 1.0 + 0 = 2880
    // High: 480 × 12 × 1.0 + 0 = 5760
    expect(result.area).toBe(480);
    expect(result.costLow).toBe(2880);
    expect(result.costHigh).toBe(5760);
    expect(result.costMid).toBe(4320);
  });

  // ─── Test 2: Asphalt driveway ───
  it('calculates asphalt driveway cost', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'asphalt',
      condition: 'new-install',
      grading: 'flat',
    });
    // Asphalt: $3-$7/sq ft
    // Low: 480 × 3 = 1440, High: 480 × 7 = 3360
    expect(result.costLow).toBe(1440);
    expect(result.costHigh).toBe(3360);
  });

  // ─── Test 3: Gravel driveway ───
  it('calculates gravel driveway cost', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'gravel',
      condition: 'new-install',
      grading: 'flat',
    });
    // Gravel: $1-$3/sq ft
    expect(result.costLow).toBe(480);
    expect(result.costHigh).toBe(1440);
  });

  // ─── Test 4: Pavers driveway ───
  it('calculates paver driveway cost', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'pavers',
      condition: 'new-install',
      grading: 'flat',
    });
    // Pavers: $10-$25/sq ft
    expect(result.costLow).toBe(4800);
    expect(result.costHigh).toBe(12000);
  });

  // ─── Test 5: Stamped concrete driveway ───
  it('calculates stamped concrete driveway cost', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'stamped-concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    // Stamped: $12-$20/sq ft
    expect(result.costLow).toBe(5760);
    expect(result.costHigh).toBe(9600);
  });

  // ─── Test 6: Replacement vs new install ───
  it('replacement costs 15% more than new install', () => {
    const newInstall = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'new-install', grading: 'flat',
    });
    const replacement = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'replacement', grading: 'flat',
    });
    // Replacement: 480 × 6 × 1.15 = 3312 low, 480 × 12 × 1.15 = 6624 high
    expect(replacement.costLow).toBeCloseTo((newInstall.costLow as number) * 1.15, 0);
    expect(replacement.costHigh).toBeCloseTo((newInstall.costHigh as number) * 1.15, 0);
  });

  // ─── Test 7: Resurfacing at 40% of new install ───
  it('resurfacing costs 40% of new install', () => {
    const newInstall = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'asphalt', condition: 'new-install', grading: 'flat',
    });
    const resurface = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'asphalt', condition: 'resurfacing', grading: 'flat',
    });
    expect(resurface.costLow).toBeCloseTo((newInstall.costLow as number) * 0.4, 0);
    expect(resurface.costHigh).toBeCloseTo((newInstall.costHigh as number) * 0.4, 0);
  });

  // ─── Test 8: Flat vs steep grading ───
  it('steep grading adds $3/sq ft', () => {
    const flat = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'new-install', grading: 'flat',
    });
    const steep = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'new-install', grading: 'steep',
    });
    // Steep adds $3 × 480 = $1440 to both low and high
    expect(steep.costLow).toBe((flat.costLow as number) + 480 * 3);
    expect(steep.costHigh).toBe((flat.costHigh as number) + 480 * 3);
  });

  // ─── Test 9: Slight slope adds $1/sq ft ───
  it('slight-slope adds $1/sq ft', () => {
    const flat = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'new-install', grading: 'flat',
    });
    const slope = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'new-install', grading: 'slight-slope',
    });
    expect(slope.costLow).toBe((flat.costLow as number) + 480);
    expect(slope.costHigh).toBe((flat.costHigh as number) + 480);
  });

  // ─── Test 10: Zero dimensions → 0 ───
  it('returns zero for zero dimensions', () => {
    const result = calculateDrivewayCost({
      length: 0,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    expect(result.area).toBe(0);
    expect(result.costLow).toBe(0);
    expect(result.costHigh).toBe(0);
    expect(result.costMid).toBe(0);
    expect(result.costPerSqFt).toBe(0);
  });

  // ─── Test 11: Metric inputs ───
  it('converts metric inputs correctly', () => {
    const result = calculateDrivewayCost({
      length: 12,       // 12 m ≈ 39.37 ft
      lengthUnit: 'm',
      width: 3.6,       // 3.6 m ≈ 11.81 ft
      widthUnit: 'm',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    // Area ≈ 39.37 × 11.81 ≈ 464.96 sq ft
    expect(result.area).toBeCloseTo(465, -1);
    expect(result.costLow).toBeGreaterThan(2500);
    expect(result.costHigh).toBeGreaterThan(5000);
  });

  // ─── Test 12: Large driveway 60×20 ───
  it('handles large 60×20 driveway', () => {
    const result = calculateDrivewayCost({
      length: 60,
      lengthUnit: 'ft',
      width: 20,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    // Area = 1200 sq ft
    expect(result.area).toBe(1200);
    expect(result.costLow).toBe(7200);   // 1200 × $6
    expect(result.costHigh).toBe(14400); // 1200 × $12
  });

  // ─── Test 13: Small driveway 20×10 ───
  it('handles small 20×10 driveway', () => {
    const result = calculateDrivewayCost({
      length: 20,
      lengthUnit: 'ft',
      width: 10,
      widthUnit: 'ft',
      material: 'asphalt',
      condition: 'new-install',
      grading: 'flat',
    });
    expect(result.area).toBe(200);
    expect(result.costLow).toBe(600);    // 200 × $3
    expect(result.costHigh).toBe(1400);  // 200 × $7
  });

  // ─── Test 14: Cost per sq ft accuracy ───
  it('calculates cost per sq ft as midpoint of total', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    // costMid = (2880 + 5760) / 2 = 4320
    // costPerSqFt = 4320 / 480 = 9
    expect(result.costPerSqFt).toBe(9);
  });

  // ─── Test 15: Material comparison structure ───
  it('returns material comparison with all 5 materials', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    // All values should be positive
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Gravel should be cheapest, pavers most expensive
    const gravel = comparison.find(c => c.label.includes('Gravel'));
    const pavers = comparison.find(c => c.label.includes('Pavers'));
    expect(gravel!.value).toBeLessThan(pavers!.value);
  });

  // ─── Test 16: Condition multiplier with grading combined ───
  it('applies both replacement multiplier and steep grading', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'replacement',
      grading: 'steep',
    });
    // Low: 480 × 6 × 1.15 + 3 × 480 = 3312 + 1440 = 4752
    // High: 480 × 12 × 1.15 + 3 × 480 = 6624 + 1440 = 8064
    expect(result.costLow).toBe(4752);
    expect(result.costHigh).toBe(8064);
  });

  // ─── Test 17: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateDrivewayCost({
      length: 40,
      lengthUnit: 'ft',
      width: 12,
      widthUnit: 'ft',
      material: 'concrete',
      condition: 'new-install',
      grading: 'flat',
    });
    expect(result).toHaveProperty('area');
    expect(result).toHaveProperty('costLow');
    expect(result).toHaveProperty('costHigh');
    expect(result).toHaveProperty('costMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('conditionNote');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 18: Timeline text returned ───
  it('returns appropriate timeline for each material', () => {
    const concrete = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'new-install', grading: 'flat',
    });
    const asphalt = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'asphalt', condition: 'new-install', grading: 'flat',
    });
    expect(typeof concrete.timeline).toBe('string');
    expect(typeof asphalt.timeline).toBe('string');
    expect(concrete.timeline).not.toBe(asphalt.timeline);
  });

  // ─── Test 19: Condition note text returned ───
  it('returns appropriate condition note', () => {
    const result = calculateDrivewayCost({
      length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
      material: 'concrete', condition: 'replacement', grading: 'flat',
    });
    expect(typeof result.conditionNote).toBe('string');
    expect((result.conditionNote as string).length).toBeGreaterThan(20);
    expect((result.conditionNote as string)).toContain('demolition');
  });

  // ─── Test 20: Asphalt cheapest, pavers most expensive (same dims) ───
  it('asphalt is cheapest and pavers most expensive for same area', () => {
    const materials = ['concrete', 'asphalt', 'gravel', 'pavers', 'stamped-concrete'];
    const costs = materials.map(mat => {
      const r = calculateDrivewayCost({
        length: 40, lengthUnit: 'ft', width: 12, widthUnit: 'ft',
        material: mat, condition: 'new-install', grading: 'flat',
      });
      return { material: mat, mid: r.costMid as number };
    });
    const gravel = costs.find(c => c.material === 'gravel')!;
    const pavers = costs.find(c => c.material === 'pavers')!;
    const asphalt = costs.find(c => c.material === 'asphalt')!;
    expect(gravel.mid).toBeLessThan(asphalt.mid);
    expect(asphalt.mid).toBeLessThan(pavers.mid);
  });
});
