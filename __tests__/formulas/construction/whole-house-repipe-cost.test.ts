import { calculateWholeHouseRepipeCost } from '@/lib/formulas/construction/whole-house-repipe-cost';

describe('calculateWholeHouseRepipeCost', () => {
  // ─── Test 1: Medium home, copper, 1-story, 2-bath, no wall repair, no permit, national ───
  it('calculates a medium copper repipe at national average', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: $4500–$8000 × 1.0 (copper) × 1.0 (1-story) × 1.0 (2-bath) = $4500–$8000
    // Material (35%): 4500×0.35=$1575 low, 8000×0.35=$2800 high
    // Labor (65%×1.0): 4500×0.65=$2925 low, 8000×0.65=$5200 high
    // Piping low: 1575+2925=$4500, high: 2800+5200=$8000
    // Total low: $4500, high: $8000, mid: $6250
    expect(result.totalLow).toBe(4500);
    expect(result.totalHigh).toBe(8000);
    expect(result.totalMid).toBe(6250);
    expect(result.wallRepairCost).toBe(0);
    expect(result.permitCost).toBe(0);
  });

  // ─── Test 2: PEX material multiplier (0.60x) ───
  it('applies PEX material multiplier (0.60x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'pex',
      stories: '1-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: $4500×0.60=$2700 low, $8000×0.60=$4800 high
    // Material: 2700×0.35=$945, 4800×0.35=$1680
    // Labor: 2700×0.65=$1755, 4800×0.65=$3120
    // Piping: 945+1755=$2700 low, 1680+3120=$4800 high
    expect(result.totalLow).toBe(2700);
    expect(result.totalHigh).toBe(4800);
    expect(result.totalMid).toBe(3750);
  });

  // ─── Test 3: CPVC material multiplier (0.55x) ───
  it('applies CPVC material multiplier (0.55x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'cpvc',
      stories: '1-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: $4500×0.55=$2475 low, $8000×0.55=$4400 high
    expect(result.totalLow).toBe(2475);
    expect(result.totalHigh).toBe(4400);
    expect(result.totalMid).toBe(3437.5);
  });

  // ─── Test 4: Small home ───
  it('calculates small home correctly', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'small-under-1000',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    expect(result.totalLow).toBe(3000);
    expect(result.totalHigh).toBe(5000);
    expect(result.totalMid).toBe(4000);
  });

  // ─── Test 5: Large home ───
  it('calculates large home correctly', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    expect(result.totalLow).toBe(7000);
    expect(result.totalHigh).toBe(13000);
    expect(result.totalMid).toBe(10000);
  });

  // ─── Test 6: XL home ───
  it('calculates extra-large home correctly', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'xlarge-over-2500',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    expect(result.totalLow).toBe(10000);
    expect(result.totalHigh).toBe(18000);
    expect(result.totalMid).toBe(14000);
  });

  // ─── Test 7: 2-story multiplier (1.15x) ───
  it('applies 2-story multiplier (1.15x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'copper',
      stories: '2-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: 4500×1.15=$5175 low, 8000×1.15=$9200 high
    expect(result.totalLow).toBe(5175);
    expect(result.totalHigh).toBe(9200);
  });

  // ─── Test 8: 3-story multiplier (1.30x) ───
  it('applies 3-story multiplier (1.30x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'copper',
      stories: '3-story',
      bathrooms: '2-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: 4500×1.30=$5850 low, 8000×1.30=$10400 high
    expect(result.totalLow).toBe(5850);
    expect(result.totalHigh).toBe(10400);
  });

  // ─── Test 9: 1-bath multiplier (0.85x) ───
  it('applies 1-bath multiplier (0.85x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '1-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: 4500×0.85=$3825 low, 8000×0.85=$6800 high
    expect(result.totalLow).toBe(3825);
    expect(result.totalHigh).toBe(6800);
  });

  // ─── Test 10: 3-bath multiplier (1.15x) ───
  it('applies 3-bath multiplier (1.15x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '3-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base: 4500×1.15=$5175 low, 8000×1.15=$9200 high
    expect(result.totalLow).toBe(5175);
    expect(result.totalHigh).toBe(9200);
  });

  // ─── Test 11: 4+ bath multiplier (1.30x) ───
  it('applies 4-plus-bath multiplier (1.30x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500',
      pipeMaterial: 'copper',
      stories: '1-story',
      bathrooms: '4-plus-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    expect(result.totalLow).toBe(5850);
    expect(result.totalHigh).toBe(10400);
  });

  // ─── Test 12: Drywall patches wall repair (+$500-$1500) ───
  it('adds drywall patches wall repair cost', () => {
    const noRepair = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const withRepair = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'drywall-patches', permitRequired: 'no', region: 'national',
    });
    expect(withRepair.wallRepairCost).toBe(1000); // (500+1500)/2
    expect((withRepair.totalLow as number)).toBe((noRepair.totalLow as number) + 500);
    expect((withRepair.totalHigh as number)).toBe((noRepair.totalHigh as number) + 1500);
  });

  // ─── Test 13: Full drywall repair (+$1500-$4000) ───
  it('adds full drywall repair cost', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'full-drywall-repair', permitRequired: 'no', region: 'national',
    });
    expect(result.wallRepairCost).toBe(2750); // (1500+4000)/2
    // TotalLow: 4500+1500 = 6000, TotalHigh: 8000+4000 = 12000
    expect(result.totalLow).toBe(6000);
    expect(result.totalHigh).toBe(12000);
  });

  // ─── Test 14: Permit required (+$200-$500) ───
  it('adds permit cost when required', () => {
    const noPermit = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const withPermit = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'yes', region: 'national',
    });
    expect(withPermit.permitCost).toBe(350); // (200+500)/2
    expect((withPermit.totalLow as number)).toBe((noPermit.totalLow as number) + 200);
    expect((withPermit.totalHigh as number)).toBe((noPermit.totalHigh as number) + 500);
  });

  // ─── Test 15: Northeast regional multiplier (1.20x on labor) ───
  it('applies northeast regional labor multiplier (1.20x)', () => {
    const national = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const northeast = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'northeast',
    });
    // National labor mid: (2925+5200)/2 = 4062.5
    // Northeast labor mid: (2925×1.2 + 5200×1.2)/2 = (3510+6240)/2 = 4875
    expect((northeast.laborCost as number)).toBeCloseTo(4875, 1);
    expect((northeast.materialCost as number)).toBe((national.materialCost as number));
    expect((northeast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 16: South regional multiplier (0.85x on labor) ───
  it('applies south regional labor multiplier (0.85x)', () => {
    const national = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const south = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'south',
    });
    expect((south.laborCost as number)).toBeLessThan((national.laborCost as number));
    expect((south.totalMid as number)).toBeLessThan((national.totalMid as number));
  });

  // ─── Test 17: West Coast regional multiplier (1.25x) ───
  it('applies west coast regional labor multiplier (1.25x)', () => {
    const national = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const westCoast = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'west-coast',
    });
    // Labor mid national: 4062.5; west coast: 4062.5 × 1.25 = 5078.125
    expect((westCoast.laborCost as number)).toBeCloseTo(5078.13, 0);
    expect((westCoast.totalMid as number)).toBeGreaterThan((national.totalMid as number));
  });

  // ─── Test 18: Midwest regional multiplier (0.90x) ───
  it('applies midwest regional labor multiplier (0.90x)', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'midwest',
    });
    // Labor low: 4500×0.65×0.90=2632.5, high: 8000×0.65×0.90=4680
    // Labor mid: (2632.5+4680)/2=3656.25
    expect((result.laborCost as number)).toBeCloseTo(3656.25, 1);
  });

  // ─── Test 19: Cost per bathroom calculation ───
  it('calculates cost per bathroom correctly', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    // totalMid = 6250, bathrooms = 2
    expect(result.costPerBathroom).toBe(3125);
  });

  // ─── Test 20: Cost per bathroom for 3-bath ───
  it('calculates cost per bathroom for 3-bath home', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '3-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    // totalMid / 3
    const expected = parseFloat(((result.totalMid as number) / 3).toFixed(2));
    expect(result.costPerBathroom).toBe(expected);
  });

  // ─── Test 21: Material comparison has all 3 types ───
  it('returns material comparison with all 3 pipe types', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(3);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // CPVC should be cheapest, copper most expensive
    const copper = comparison.find(c => c.label.includes('Copper'));
    const cpvc = comparison.find(c => c.label.includes('CPVC'));
    expect(cpvc!.value).toBeLessThan(copper!.value);
  });

  // ─── Test 22: PEX is cheaper than copper ───
  it('PEX is cheaper than copper for same home', () => {
    const copper = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const pex = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500', pipeMaterial: 'pex', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    expect((pex.totalMid as number)).toBeLessThan((copper.totalMid as number));
  });

  // ─── Test 23: CPVC is cheapest of all materials ───
  it('CPVC is the cheapest pipe material', () => {
    const copper = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const pex = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500', pipeMaterial: 'pex', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const cpvc = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500', pipeMaterial: 'cpvc', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    expect((cpvc.totalMid as number)).toBeLessThan((pex.totalMid as number));
    expect((pex.totalMid as number)).toBeLessThan((copper.totalMid as number));
  });

  // ─── Test 24: Combined multipliers (large home, PEX, 2-story, 3-bath) ───
  it('applies combined multipliers correctly', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'large-1500-2500',
      pipeMaterial: 'pex',
      stories: '2-story',
      bathrooms: '3-bath',
      wallRepair: 'none',
      permitRequired: 'no',
      region: 'national',
    });
    // Base low: 7000 × 0.60 × 1.15 × 1.15 = 7000 × 0.7935 = 5554.5
    // Base high: 13000 × 0.60 × 1.15 × 1.15 = 13000 × 0.7935 = 10315.5
    const expectedLow = parseFloat((7000 * 0.60 * 1.15 * 1.15).toFixed(2));
    const expectedHigh = parseFloat((13000 * 0.60 * 1.15 * 1.15).toFixed(2));
    expect(result.totalLow).toBeCloseTo(expectedLow, 0);
    expect(result.totalHigh).toBeCloseTo(expectedHigh, 0);
  });

  // ─── Test 25: All add-ons combined (wall repair + permit) ───
  it('handles all add-ons together', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'drywall-patches', permitRequired: 'yes', region: 'national',
    });
    // Piping: $4500–$8000
    // Wall repair: $500–$1500
    // Permit: $200–$500
    // TotalLow: 4500+500+200 = 5200
    // TotalHigh: 8000+1500+500 = 10000
    expect(result.totalLow).toBe(5200);
    expect(result.totalHigh).toBe(10000);
    expect(result.totalMid).toBe(7600);
  });

  // ─── Test 26: Output structure has all expected fields ───
  it('returns all expected output fields', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    expect(result).toHaveProperty('pipingCost');
    expect(result).toHaveProperty('materialCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('wallRepairCost');
    expect(result).toHaveProperty('permitCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerBathroom');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 27: Default inputs produce valid output ───
  it('uses default inputs when values are missing', () => {
    const result = calculateWholeHouseRepipeCost({});
    // Defaults: medium, copper, 1-story, 2-bath, no wall, no permit, national
    expect(result.totalLow).toBe(4500);
    expect(result.totalHigh).toBe(8000);
    expect(result.totalMid).toBe(6250);
  });

  // ─── Test 28: Regional multiplier only affects labor, not material ───
  it('regional multiplier changes labor but not material cost', () => {
    const national = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const northeast = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'northeast',
    });
    expect(national.materialCost).toBe(northeast.materialCost);
    expect((northeast.laborCost as number)).toBeGreaterThan((national.laborCost as number));
  });

  // ─── Test 29: Timeline varies by home size ───
  it('returns correct timeline by home size', () => {
    const small = calculateWholeHouseRepipeCost({ homeSize: 'small-under-1000' });
    const xl = calculateWholeHouseRepipeCost({ homeSize: 'xlarge-over-2500' });
    expect(small.timeline).toBe('2–4 days');
    expect(xl.timeline).toBe('5–10 days');
  });

  // ─── Test 30: Mid-atlantic regional multiplier (1.15x) ───
  it('applies mid-atlantic regional labor multiplier (1.15x)', () => {
    const national = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const midAtl = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'mid-atlantic',
    });
    expect((midAtl.laborCost as number)).toBeCloseTo((national.laborCost as number) * 1.15, 1);
  });

  // ─── Test 31: Mountain-west regional multiplier (0.95x) ───
  it('applies mountain-west regional labor multiplier (0.95x)', () => {
    const national = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    const mtWest = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'mountain-west',
    });
    expect((mtWest.laborCost as number)).toBeCloseTo((national.laborCost as number) * 0.95, 1);
  });

  // ─── Test 32: Material/labor split is 35/65 ───
  it('splits cost 35% material and 65% labor', () => {
    const result = calculateWholeHouseRepipeCost({
      homeSize: 'medium-1000-1500', pipeMaterial: 'copper', stories: '1-story',
      bathrooms: '2-bath', wallRepair: 'none', permitRequired: 'no', region: 'national',
    });
    // materialCost mid: (1575+2800)/2 = 2187.5
    // laborCost mid: (2925+5200)/2 = 4062.5
    // pipingCost = 2187.5 + 4062.5 = 6250
    expect(result.materialCost).toBe(2187.5);
    expect(result.laborCost).toBe(4062.5);
    expect(result.pipingCost).toBe(6250);
  });
});
