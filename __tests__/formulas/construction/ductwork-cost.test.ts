import { calculateDuctworkCost } from '@/lib/formulas/construction/ductwork-cost';

describe('calculateDuctworkCost', () => {
  // ─── Test 1: Default inputs — medium home, sheet-metal, new-installation, standard-r6, accessible-attic, national ───
  it('calculates default inputs (medium home, sheet-metal, new install, national)', () => {
    const result = calculateDuctworkCost({});
    // Base: low=3500, high=6000, sqft=1250
    // matMult=1.0, projMult=1.0, accessMult=1.0, regionMult=1.0
    // adjustedLow = 3500 * 1.0 * 1.0 = 3500
    // adjustedHigh = 6000 * 1.0 * 1.0 = 6000
    // materialCostLow = 3500 * 0.40 = 1400
    // materialCostHigh = 6000 * 0.40 = 2400
    // laborCostLow = 3500 * 0.60 * 1.0 * 1.0 = 2100
    // laborCostHigh = 6000 * 0.60 * 1.0 * 1.0 = 3600
    // insulation = 0 / 0
    // totalLow = 1400 + 2100 + 0 = 3500
    // totalHigh = 2400 + 3600 + 0 = 6000
    // totalMid = (3500 + 6000) / 2 = 4750
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(6000);
    expect(result.totalMid).toBe(4750);
    expect(result.materialCost).toBe(1900);   // (1400 + 2400) / 2
    expect(result.laborCost).toBe(2850);      // (2100 + 3600) / 2
    expect(result.insulationCost).toBe(0);
  });

  // ─── Test 2: Small home — under 1,000 sq ft ───
  it('calculates small home base cost ($2,000-$3,500)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'small-under-1000',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    expect(result.totalLow).toBe(2000);
    expect(result.totalHigh).toBe(3500);
    expect(result.totalMid).toBe(2750);
  });

  // ─── Test 3: Large home — 1,500-2,500 sq ft ───
  it('calculates large home base cost ($5,500-$9,000)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'large-1500-2500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    expect(result.totalLow).toBe(5500);
    expect(result.totalHigh).toBe(9000);
    expect(result.totalMid).toBe(7250);
  });

  // ─── Test 4: Extra-large home — over 2,500 sq ft ───
  it('calculates extra-large home base cost ($8,000-$14,000)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'xlarge-over-2500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    expect(result.totalLow).toBe(8000);
    expect(result.totalHigh).toBe(14000);
    expect(result.totalMid).toBe(11000);
  });

  // ─── Test 5: Flexible duct material (0.70x multiplier) ───
  it('applies flexible duct material multiplier (0.70x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'flexible',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // adjustedLow = 3500 * 0.70 = 2450
    // adjustedHigh = 6000 * 0.70 = 4200
    expect(result.totalLow).toBe(2450);
    expect(result.totalHigh).toBe(4200);
    expect(result.totalMid).toBe(3325);
  });

  // ─── Test 6: Fiberglass board material (1.15x multiplier) ───
  it('applies fiberglass board material multiplier (1.15x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'fiberglass-board',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // adjustedLow = 3500 * 1.15 = 4025
    // adjustedHigh = 6000 * 1.15 = 6900
    expect(result.totalLow).toBe(4025);
    expect(result.totalHigh).toBe(6900);
    expect(result.totalMid).toBe(5462.5);
  });

  // ─── Test 7: Replacement project type (1.20x multiplier) ───
  it('applies replacement project type multiplier (1.20x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'replacement',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // adjustedLow = 3500 * 1.20 = 4200
    // adjustedHigh = 6000 * 1.20 = 7200
    expect(result.totalLow).toBe(4200);
    expect(result.totalHigh).toBe(7200);
    expect(result.totalMid).toBe(5700);
  });

  // ─── Test 8: Modification project type (0.50x multiplier) ───
  it('applies modification project type multiplier (0.50x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'modification',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // adjustedLow = 3500 * 0.50 = 1750
    // adjustedHigh = 6000 * 0.50 = 3000
    expect(result.totalLow).toBe(1750);
    expect(result.totalHigh).toBe(3000);
    expect(result.totalMid).toBe(2375);
  });

  // ─── Test 9: Upgraded R-8 insulation adder (+$500 low, +$1500 high) ───
  it('adds upgraded R-8 insulation cost ($500-$1,500)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'upgraded-r8',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // totalLow = 3500 + 500 = 4000
    // totalHigh = 6000 + 1500 = 7500
    expect(result.totalLow).toBe(4000);
    expect(result.totalHigh).toBe(7500);
    expect(result.insulationCost).toBe(1000); // (500 + 1500) / 2
  });

  // ─── Test 10: No insulation credit (-$500 low, -$300 high) ───
  it('applies no-insulation credit (-$500 to -$300)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'none',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // totalLow = 3500 + (-500) = 3000
    // totalHigh = 6000 + (-300) = 5700
    expect(result.totalLow).toBe(3000);
    expect(result.totalHigh).toBe(5700);
    expect(result.insulationCost).toBe(-400); // (-500 + -300) / 2
  });

  // ─── Test 11: Crawlspace access (1.15x on labor only) ───
  it('applies crawlspace access multiplier (1.15x on labor)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'crawlspace',
      region: 'national',
    });
    // materialCostLow = 3500 * 0.40 = 1400
    // laborCostLow = 3500 * 0.60 * 1.15 = 2415
    // totalLow = 1400 + 2415 = 3815
    // materialCostHigh = 6000 * 0.40 = 2400
    // laborCostHigh = 6000 * 0.60 * 1.15 = 4140
    // totalHigh = 2400 + 4140 = 6540
    expect(result.totalLow).toBe(3815);
    expect(result.totalHigh).toBe(6540);
    // Material portion unchanged
    expect(result.materialCost).toBe(1900);
  });

  // ─── Test 12: In-wall/ceiling access (1.35x on labor only) ───
  it('applies in-wall/ceiling access multiplier (1.35x on labor)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'in-wall-ceiling',
      region: 'national',
    });
    // materialCostLow = 1400
    // laborCostLow = 3500 * 0.60 * 1.35 = 2835
    // totalLow = 1400 + 2835 = 4235
    // laborCostHigh = 6000 * 0.60 * 1.35 = 4860
    // totalHigh = 2400 + 4860 = 7260
    expect(result.totalLow).toBe(4235);
    expect(result.totalHigh).toBe(7260);
    expect(result.materialCost).toBe(1900);
  });

  // ─── Test 13: Northeast region (1.20x labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'northeast',
    });
    // materialCostLow = 1400
    // laborCostLow = 3500 * 0.60 * 1.20 = 2520
    // totalLow = 1400 + 2520 = 3920
    // laborCostHigh = 6000 * 0.60 * 1.20 = 4320
    // totalHigh = 2400 + 4320 = 6720
    expect(result.totalLow).toBe(3920);
    expect(result.totalHigh).toBe(6720);
    expect(result.materialCost).toBe(1900);
  });

  // ─── Test 14: West Coast region (1.25x labor) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'west-coast',
    });
    // laborCostLow = 3500 * 0.60 * 1.25 = 2625
    // totalLow = 1400 + 2625 = 4025
    // laborCostHigh = 6000 * 0.60 * 1.25 = 4500
    // totalHigh = 2400 + 4500 = 6900
    expect(result.totalLow).toBe(4025);
    expect(result.totalHigh).toBe(6900);
  });

  // ─── Test 15: Mid-Atlantic region (1.15x labor) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'mid-atlantic',
    });
    // laborCostLow = 3500 * 0.60 * 1.15 = 2415
    // totalLow = 1400 + 2415 = 3815
    // laborCostHigh = 6000 * 0.60 * 1.15 = 4140
    // totalHigh = 2400 + 4140 = 6540
    expect(result.totalLow).toBe(3815);
    expect(result.totalHigh).toBe(6540);
  });

  // ─── Test 16: Midwest region (0.90x labor) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'midwest',
    });
    // laborCostLow = 3500 * 0.60 * 0.90 = 1890
    // totalLow = 1400 + 1890 = 3290
    // laborCostHigh = 6000 * 0.60 * 0.90 = 3240
    // totalHigh = 2400 + 3240 = 5640
    expect(result.totalLow).toBe(3290);
    expect(result.totalHigh).toBe(5640);
  });

  // ─── Test 17: South region (0.85x labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'south',
    });
    // laborCostLow = 3500 * 0.60 * 0.85 = 1785
    // totalLow = 1400 + 1785 = 3185
    // laborCostHigh = 6000 * 0.60 * 0.85 = 3060
    // totalHigh = 2400 + 3060 = 5460
    expect(result.totalLow).toBe(3185);
    expect(result.totalHigh).toBe(5460);
  });

  // ─── Test 18: Mountain West region (0.95x labor) ───
  it('applies mountain west regional labor multiplier (0.95x)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'mountain-west',
    });
    // laborCostLow = 3500 * 0.60 * 0.95 = 1995
    // totalLow = 1400 + 1995 = 3395
    // laborCostHigh = 6000 * 0.60 * 0.95 = 3420
    // totalHigh = 2400 + 3420 = 5820
    expect(result.totalLow).toBe(3395);
    expect(result.totalHigh).toBe(5820);
  });

  // ─── Test 19: Regional multiplier only affects labor, not material ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    const westCoast = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'west-coast',
    });
    expect(westCoast.materialCost).toBe(national.materialCost);
    expect((westCoast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 20: Access multiplier only affects labor, not material ───
  it('access multiplier changes labor but not material cost', () => {
    const attic = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    const inWall = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'in-wall-ceiling',
      region: 'national',
    });
    expect(inWall.materialCost).toBe(attic.materialCost);
    expect((inWall.laborCost as number)).toBeGreaterThan((attic.laborCost as number));
  });

  // ─── Test 21: Full build — xlarge, fiberglass-board, replacement, upgraded-r8, in-wall-ceiling, northeast ───
  it('calculates fully loaded scenario (xlarge, fiberglass, replacement, R-8, in-wall, northeast)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'xlarge-over-2500',
      ductMaterial: 'fiberglass-board',
      projectType: 'replacement',
      insulation: 'upgraded-r8',
      accessType: 'in-wall-ceiling',
      region: 'northeast',
    });
    // Base: low=8000, high=14000
    // adjustedLow = 8000 * 1.15 * 1.20 = 11040
    // adjustedHigh = 14000 * 1.15 * 1.20 = 19320
    // materialCostLow = 11040 * 0.40 = 4416
    // materialCostHigh = 19320 * 0.40 = 7728
    // laborCostLow = 11040 * 0.60 * 1.35 * 1.20 = 10730.88
    // laborCostHigh = 19320 * 0.60 * 1.35 * 1.20 = 18779.04
    // insulLow = 500, insulHigh = 1500
    // totalLow = 4416 + 10730.88 + 500 = 15646.88
    // totalHigh = 7728 + 18779.04 + 1500 = 28007.04
    expect(result.totalLow).toBeCloseTo(15646.88, 0);
    expect(result.totalHigh).toBeCloseTo(28007.04, 0);
    expect(result.totalMid).toBeCloseTo((15646.88 + 28007.04) / 2, 0);
  });

  // ─── Test 22: Budget scenario — small, flexible, modification, no insulation, south ───
  it('calculates budget scenario (small, flexible, modification, no insulation, south)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'small-under-1000',
      ductMaterial: 'flexible',
      projectType: 'modification',
      insulation: 'none',
      accessType: 'accessible-attic',
      region: 'south',
    });
    // Base: low=2000, high=3500
    // adjustedLow = 2000 * 0.70 * 0.50 = 700
    // adjustedHigh = 3500 * 0.70 * 0.50 = 1225
    // materialCostLow = 700 * 0.40 = 280
    // materialCostHigh = 1225 * 0.40 = 490
    // laborCostLow = 700 * 0.60 * 1.0 * 0.85 = 357
    // laborCostHigh = 1225 * 0.60 * 1.0 * 0.85 = 624.75
    // insulLow = -500, insulHigh = -300
    // totalLow = 280 + 357 + (-500) = 137
    // totalHigh = 490 + 624.75 + (-300) = 814.75
    expect(result.totalLow).toBeCloseTo(137, 0);
    expect(result.totalHigh).toBeCloseTo(814.75, 0);
  });

  // ─── Test 23: Cost per sq ft calculation ───
  it('calculates cost per square foot from total mid and home sqft', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // totalMid = 4750, sqft = 1250
    // costPerSqFt = 4750 / 1250 = 3.80
    expect(result.costPerSqFt).toBe(3.8);
  });

  // ─── Test 24: Material comparison returns 3 entries ───
  it('returns material comparison with all 3 duct material types', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(3);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Flexible should be cheapest, fiberglass board most expensive
    const flexible = comparison.find(c => c.label.includes('Flexible'));
    const sheetMetal = comparison.find(c => c.label.includes('Sheet Metal'));
    const fiberglass = comparison.find(c => c.label.includes('Fiberglass'));
    expect(flexible!.value).toBeLessThan(sheetMetal!.value);
    expect(sheetMetal!.value).toBeLessThan(fiberglass!.value);
  });

  // ─── Test 25: Timeline output for each project type ───
  it('returns correct timeline for each project type', () => {
    const newInstall = calculateDuctworkCost({ projectType: 'new-installation' });
    expect(typeof newInstall.timeline).toBe('string');
    expect((newInstall.timeline as string).length).toBeGreaterThan(0);

    const replacement = calculateDuctworkCost({ projectType: 'replacement' });
    expect((replacement.timeline as string)).toContain('demo');

    const modification = calculateDuctworkCost({ projectType: 'modification' });
    expect(typeof modification.timeline).toBe('string');
  });

  // ─── Test 26: Output structure — all expected fields present ───
  it('returns all expected output fields', () => {
    const result = calculateDuctworkCost({});
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('insulationCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerSqFt');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 27: Combined access + region multipliers stack on labor ───
  it('stacks access and region multipliers on labor cost', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'crawlspace',       // 1.15x
      region: 'northeast',            // 1.20x
    });
    // laborCostLow = 3500 * 0.60 * 1.15 * 1.20 = 2898
    // laborCostHigh = 6000 * 0.60 * 1.15 * 1.20 = 4968
    // materialCostLow = 1400, materialCostHigh = 2400
    // totalLow = 1400 + 2898 = 4298
    // totalHigh = 2400 + 4968 = 7368
    expect(result.totalLow).toBeCloseTo(4298, 0);
    expect(result.totalHigh).toBeCloseTo(7368, 0);
  });

  // ─── Test 28: Material + project multipliers compound correctly ───
  it('compounds material and project multipliers on base cost', () => {
    const result = calculateDuctworkCost({
      homeSize: 'small-under-1000',
      ductMaterial: 'fiberglass-board',   // 1.15x
      projectType: 'replacement',         // 1.20x
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // adjustedLow = 2000 * 1.15 * 1.20 = 2760
    // adjustedHigh = 3500 * 1.15 * 1.20 = 4830
    // totalLow = 2760 * 0.40 + 2760 * 0.60 = 2760
    // totalHigh = 4830
    expect(result.totalLow).toBeCloseTo(2760, 0);
    expect(result.totalHigh).toBeCloseTo(4830, 0);
  });

  // ─── Test 29: Unknown inputs fall back to defaults ───
  it('falls back to defaults for unknown input values', () => {
    const result = calculateDuctworkCost({
      homeSize: 'invalid-size',
      ductMaterial: 'unknown-material',
      projectType: 'unknown-type',
      insulation: 'unknown-insulation',
      accessType: 'unknown-access',
      region: 'unknown-region',
    });
    // Falls back to medium home (via ?? fallback), 1.0x material, 1.0x project,
    // standard-r6, 1.0x access, 1.0x region
    expect(result.totalLow).toBe(3500);
    expect(result.totalHigh).toBe(6000);
    expect(result.totalMid).toBe(4750);
  });

  // ─── Test 30: Material/labor split is 40/60 of base ───
  it('material is 40% and labor is 60% of adjusted base (national, attic)', () => {
    const result = calculateDuctworkCost({
      homeSize: 'medium-1000-1500',
      ductMaterial: 'sheet-metal',
      projectType: 'new-installation',
      insulation: 'standard-r6',
      accessType: 'accessible-attic',
      region: 'national',
    });
    // materialCost mid: (1400 + 2400) / 2 = 1900
    // laborCost mid: (2100 + 3600) / 2 = 2850
    // Total base mid (excl insulation): 4750
    expect(result.materialCost).toBe(1900);
    expect(result.laborCost).toBe(2850);
    expect((result.materialCost as number) + (result.laborCost as number)).toBe(4750);
  });
});
