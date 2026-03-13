import { calculateGutterReplacementCost } from '@/lib/formulas/construction/gutter-replacement-cost';

describe('calculateGutterReplacementCost', () => {
  // ─── Test 1: Standard aluminum K-style, 150 linft, national ───
  it('calculates standard 150 linft aluminum K-style gutters', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 4,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Material: 150 × $2.40 = $360 low, 150 × $4.80 = $720 high
    // Labor: 150 × ($3.60 × 1.0 + $0) × 1.0 = $540 low, 150 × ($7.20 × 1.0 + $0) × 1.0 = $1080 high
    // Gutter low: 360 + 540 = 900, high: 720 + 1080 = 1800
    // Downspout low: 4 × $15 = $60, high: 4 × $25 = $100
    // Total low: 900 + 60 = 960, high: 1800 + 100 = 1900
    // Total mid: (960 + 1900) / 2 = 1430
    expect(result.totalLow).toBe(960);
    expect(result.totalHigh).toBe(1900);
    expect(result.totalMid).toBe(1430);
  });

  // ─── Test 2: Vinyl gutters ───
  it('calculates vinyl gutter cost', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'vinyl',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Material: 150 × $1.20 = $180 low, 150 × $2.80 = $420 high
    // Labor: 150 × $1.80 = $270 low, 150 × $4.20 = $630 high
    // Total low: 180 + 270 = 450, high: 420 + 630 = 1050
    expect(result.totalLow).toBe(450);
    expect(result.totalHigh).toBe(1050);
  });

  // ─── Test 3: Steel gutters ───
  it('calculates steel gutter cost', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'steel',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Material: 150 × $3.20 = $480 low, 150 × $6.00 = $900 high
    // Labor: 150 × $4.80 = $720 low, 150 × $9.00 = $1350 high
    // Total low: 480 + 720 = 1200, high: 900 + 1350 = 2250
    expect(result.totalLow).toBe(1200);
    expect(result.totalHigh).toBe(2250);
  });

  // ─── Test 4: Copper gutters ───
  it('calculates copper gutter cost', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'copper',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Material: 150 × $7.20 = $1080 low, 150 × $14.00 = $2100 high
    // Labor: 150 × $10.80 = $1620 low, 150 × $21.00 = $3150 high
    // Total low: 1080 + 1620 = 2700, high: 2100 + 3150 = 5250
    expect(result.totalLow).toBe(2700);
    expect(result.totalHigh).toBe(5250);
  });

  // ─── Test 5: Zinc gutters ───
  it('calculates zinc gutter cost', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'zinc',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Material: 150 × $6.00 = $900 low, 150 × $10.00 = $1500 high
    // Labor: 150 × $9.00 = $1350 low, 150 × $15.00 = $2250 high
    // Total low: 900 + 1350 = 2250, high: 1500 + 2250 = 3750
    expect(result.totalLow).toBe(2250);
    expect(result.totalHigh).toBe(3750);
  });

  // ─── Test 6: Half-round style multiplier ───
  it('half-round costs 25% more than k-style for material and labor base', () => {
    const kStyle = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const halfRound = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'half-round',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // K-style: mat low 100×2.40=240, lab low 100×3.60=360 → 600
    // Half-round: mat low 100×2.40×1.25=300, lab low 100×3.60×1.25=450 → 750
    expect(kStyle.totalLow).toBe(600);
    expect(halfRound.totalLow).toBe(750);
    // Verify 25% more
    expect(halfRound.totalLow).toBeCloseTo((kStyle.totalLow as number) * 1.25, 2);
  });

  // ─── Test 7: 2-story adjustment ───
  it('2-story adds $1.50/linft to labor', () => {
    const oneStory = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const twoStory = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '2-story',
      region: 'national',
    });
    // 1-story: labor low = 100 × (3.60 + 0) = 360
    // 2-story: labor low = 100 × (3.60 + 1.50) = 510
    // Difference in total: 510 - 360 = 150 (both low and high)
    expect((twoStory.totalLow as number) - (oneStory.totalLow as number)).toBe(150);
    expect((twoStory.totalHigh as number) - (oneStory.totalHigh as number)).toBe(150);
  });

  // ─── Test 8: 3-story adjustment ───
  it('3-story adds $4.00/linft to labor', () => {
    const oneStory = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const threeStory = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '3-story',
      region: 'national',
    });
    // Difference: 100 × $4.00 = $400 on both low and high
    expect((threeStory.totalLow as number) - (oneStory.totalLow as number)).toBe(400);
    expect((threeStory.totalHigh as number) - (oneStory.totalHigh as number)).toBe(400);
  });

  // ─── Test 9: Downspout count ───
  it('adds correct downspout cost', () => {
    const noDS = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const sixDS = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 6,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // 6 downspouts: low = 6 × $15 = $90, high = 6 × $25 = $150
    expect((sixDS.totalLow as number) - (noDS.totalLow as number)).toBe(90);
    expect((sixDS.totalHigh as number) - (noDS.totalHigh as number)).toBe(150);
    expect(sixDS.downspoutCost).toBe(120); // mid = (90 + 150) / 2
  });

  // ─── Test 10: Basic-screen gutter guards ───
  it('adds basic-screen guard cost', () => {
    const noGuard = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const basicScreen = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'basic-screen',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Basic-screen: 100 × $4 = $400 low, 100 × $6 = $600 high
    expect((basicScreen.totalLow as number) - (noGuard.totalLow as number)).toBe(400);
    expect((basicScreen.totalHigh as number) - (noGuard.totalHigh as number)).toBe(600);
    expect(basicScreen.guardCost).toBe(500); // mid
  });

  // ─── Test 11: Micro-mesh gutter guards ───
  it('adds micro-mesh guard cost', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 200,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'micro-mesh',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Micro-mesh: 200 × $6 = $1200 low, 200 × $10 = $2000 high
    expect(result.guardCost).toBe(1600); // mid = (1200 + 2000) / 2
  });

  // ─── Test 12: Reverse-curve gutter guards ───
  it('adds reverse-curve guard cost', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'reverse-curve',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Reverse-curve: 100 × $7 = $700 low, 100 × $12 = $1200 high
    expect(result.guardCost).toBe(950); // mid = (700 + 1200) / 2
  });

  // ─── Test 13: Old gutter removal ───
  it('adds old gutter removal cost', () => {
    const noRemoval = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const withRemoval = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'yes',
      stories: '1-story',
      region: 'national',
    });
    // Removal: 100 × $1.50 = $150 low, 100 × $3.00 = $300 high
    expect((withRemoval.totalLow as number) - (noRemoval.totalLow as number)).toBe(150);
    expect((withRemoval.totalHigh as number) - (noRemoval.totalHigh as number)).toBe(300);
    expect(withRemoval.removalCost).toBe(225); // mid = (150 + 300) / 2
  });

  // ─── Test 14: Northeast regional multiplier ───
  it('applies northeast regional multiplier to labor only', () => {
    const national = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const northeast = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'northeast',
    });
    // National: mat low=240, lab low=360, total low=600
    // Northeast: mat low=240, lab low=360×1.20=432, total low=672
    expect(national.totalLow).toBe(600);
    expect(northeast.totalLow).toBe(672);
    // Material portion unchanged
    // The difference should be only from labor: (432-360)=72 low, similarly for high
    expect((northeast.totalLow as number) - (national.totalLow as number)).toBe(72);
  });

  // ─── Test 15: South regional multiplier ───
  it('applies south regional multiplier to labor only', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'south',
    });
    // Material low: 100 × 2.40 = 240
    // Labor low: 100 × 3.60 × 0.85 = 306
    // Total low: 240 + 306 = 546
    expect(result.totalLow).toBe(546);
  });

  // ─── Test 16: West coast regional multiplier ───
  it('applies west-coast regional multiplier to labor only', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'west-coast',
    });
    // Material low: 100 × 2.40 = 240
    // Labor low: 100 × 3.60 × 1.25 = 450
    // Total low: 240 + 450 = 690
    expect(result.totalLow).toBe(690);
  });

  // ─── Test 17: Zero length ───
  it('returns zero for zero gutter length', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 0,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    expect(result.totalLow).toBe(0);
    expect(result.totalHigh).toBe(0);
    expect(result.totalMid).toBe(0);
    expect(result.costPerLinFt).toBe(0);
  });

  // ─── Test 18: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 4,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    expect(result).toHaveProperty('gutterLength');
    expect(result).toHaveProperty('gutterCost');
    expect(result).toHaveProperty('downspoutCost');
    expect(result).toHaveProperty('guardCost');
    expect(result).toHaveProperty('removalCost');
    expect(result).toHaveProperty('totalLow');
    expect(result).toHaveProperty('totalHigh');
    expect(result).toHaveProperty('totalMid');
    expect(result).toHaveProperty('costPerLinFt');
    expect(result).toHaveProperty('materialComparison');
    expect(result).toHaveProperty('timeline');
  });

  // ─── Test 19: Material comparison structure ───
  it('returns material comparison with all 5 materials', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 150,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    const comparison = result.materialComparison as Array<{ label: string; value: number }>;
    expect(comparison).toHaveLength(5);
    comparison.forEach(item => {
      expect(item.value).toBeGreaterThan(0);
      expect(item.label).toBeTruthy();
    });
    // Vinyl should be cheapest, copper most expensive
    const vinyl = comparison.find(c => c.label.includes('Vinyl'));
    const copper = comparison.find(c => c.label.includes('Copper'));
    expect(vinyl!.value).toBeLessThan(copper!.value);
  });

  // ─── Test 20: Material cost ordering ───
  it('material costs order: vinyl < aluminum < steel < zinc < copper', () => {
    const materials = ['vinyl', 'aluminum', 'steel', 'zinc', 'copper'];
    const costs = materials.map(mat => {
      const r = calculateGutterReplacementCost({
        gutterLength: 100,
        gutterMaterial: mat,
        gutterStyle: 'k-style',
        downspoutCount: 0,
        gutterGuards: 'none',
        oldGutterRemoval: 'none',
        stories: '1-story',
        region: 'national',
      });
      return { material: mat, mid: r.totalMid as number };
    });
    expect(costs[0].mid).toBeLessThan(costs[1].mid); // vinyl < aluminum
    expect(costs[1].mid).toBeLessThan(costs[2].mid); // aluminum < steel
    expect(costs[2].mid).toBeLessThan(costs[3].mid); // steel < zinc
    expect(costs[3].mid).toBeLessThan(costs[4].mid); // zinc < copper
  });

  // ─── Test 21: Cost per linear foot ───
  it('calculates cost per linear foot correctly', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 200,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // totalMid / gutterLength
    expect(result.costPerLinFt).toBe((result.totalMid as number) / 200);
  });

  // ─── Test 22: Combined effects — half-round + 2-story + guards + removal + northeast ───
  it('combines all adjustments correctly', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 200,
      gutterMaterial: 'aluminum',
      gutterStyle: 'half-round',
      downspoutCount: 6,
      gutterGuards: 'basic-screen',
      oldGutterRemoval: 'yes',
      stories: '2-story',
      region: 'northeast',
    });
    // Material: 200 × 2.40 × 1.25 = 600 low, 200 × 4.80 × 1.25 = 1200 high
    // Labor: 200 × (3.60 × 1.25 + 1.50) × 1.20 = 200 × (4.50 + 1.50) × 1.20 = 200 × 6.00 × 1.20 = 1440 low
    //        200 × (7.20 × 1.25 + 1.50) × 1.20 = 200 × (9.00 + 1.50) × 1.20 = 200 × 10.50 × 1.20 = 2520 high
    // Gutter: low 600+1440=2040, high 1200+2520=3720
    // Downspout: low 6×15=90, high 6×25=150
    // Guard: low 200×4=800, high 200×6=1200
    // Removal: low 200×1.50=300, high 200×3.00=600
    // Total low: 2040+90+800+300 = 3230
    // Total high: 3720+150+1200+600 = 5670
    expect(result.totalLow).toBe(3230);
    expect(result.totalHigh).toBe(5670);
    expect(result.totalMid).toBe(4450);
  });

  // ─── Test 23: Timeline text returned ───
  it('returns appropriate timeline for each material', () => {
    const aluminum = calculateGutterReplacementCost({
      gutterLength: 100, gutterMaterial: 'aluminum', gutterStyle: 'k-style',
      downspoutCount: 0, gutterGuards: 'none', oldGutterRemoval: 'none',
      stories: '1-story', region: 'national',
    });
    const copper = calculateGutterReplacementCost({
      gutterLength: 100, gutterMaterial: 'copper', gutterStyle: 'k-style',
      downspoutCount: 0, gutterGuards: 'none', oldGutterRemoval: 'none',
      stories: '1-story', region: 'national',
    });
    expect(typeof aluminum.timeline).toBe('string');
    expect(typeof copper.timeline).toBe('string');
    expect(copper.timeline).not.toBe(aluminum.timeline);
    expect((copper.timeline as string)).toContain('custom fabrication');
  });

  // ─── Test 24: Midwest regional multiplier ───
  it('applies midwest regional multiplier (0.90) to labor only', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'midwest',
    });
    // Material low: 100 × 2.40 = 240
    // Labor low: 100 × 3.60 × 0.90 = 324
    // Total low: 240 + 324 = 564
    expect(result.totalLow).toBe(564);
  });

  // ─── Test 25: Gutter cost output (material + labor mid) ───
  it('gutterCost is the mid of material + labor', () => {
    const result = calculateGutterReplacementCost({
      gutterLength: 100,
      gutterMaterial: 'aluminum',
      gutterStyle: 'k-style',
      downspoutCount: 0,
      gutterGuards: 'none',
      oldGutterRemoval: 'none',
      stories: '1-story',
      region: 'national',
    });
    // Gutter low: 240 + 360 = 600, high: 480 + 720 = 1200
    // gutterCost (mid) = (600 + 1200) / 2 = 900
    expect(result.gutterCost).toBe(900);
  });
});
