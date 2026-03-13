import { calculateMetalRoofing } from '@/lib/formulas/construction/metal-roofing';

describe('calculateMetalRoofing', () => {
  // ─── Test 1: Standard gable roof 40×30 (2 sides), standing seam ───
  it('calculates a standard 40×30 gable roof with standing seam', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    // Area per side = 40*30 = 1200, total = 2400 sq ft
    expect(result.totalArea).toBe(2400);
    // Squares = 2400 / 100 = 24
    expect(result.squares).toBe(24);
    // Panel length = roofWidth = 30 ft
    expect(result.panelLength).toBe(30);
  });

  // ─── Test 2: Shed roof (1 side) ───
  it('calculates a single-side shed roof', () => {
    const result = calculateMetalRoofing({
      roofLength: 30,
      roofLengthUnit: 'ft',
      roofWidth: 15,
      roofWidthUnit: 'ft',
      roofSides: '1',
      panelType: 'corrugated',
      panelWidth: 26,
      overlap: 2,
      wasteFactor: 15,
    });
    // Area = 30*15*1 = 450 sq ft
    expect(result.totalArea).toBe(450);
    expect(result.squares).toBe(4.5);
  });

  // ─── Test 3: Panel count with 15% waste ───
  it('applies waste factor to panel count', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    // Effective width = (16-1)/12 = 1.25 ft
    // Panels per row = ceil(40/1.25) = 32
    // Panels without waste = 32 * 2 = 64
    // With 15% waste = ceil(64 * 1.15) = ceil(73.6) = 74
    expect(result.panelsWithoutWaste).toBe(64);
    expect(result.totalPanels).toBe(74);
  });

  // ─── Test 4: Corrugated panels (wider, different cost) ───
  it('calculates corrugated panel specs', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'corrugated',
      panelWidth: 26,
      overlap: 2,
      wasteFactor: 15,
    });
    // Effective width = (26-2)/12 = 2 ft
    // Panels per row = ceil(40/2) = 20
    // Without waste = 20*2 = 40
    expect(result.panelsWithoutWaste).toBe(40);
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    const low = cost.find(c => c.label.includes('Low'));
    const high = cost.find(c => c.label.includes('High'));
    // 2400 sq ft * $4 = $9600 low, 2400 * $8 = $19200 high
    expect(low!.value).toBe(9600);
    expect(high!.value).toBe(19200);
  });

  // ─── Test 5: R-panel type ───
  it('calculates R-panel cost range', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'r-panel',
      panelWidth: 36,
      overlap: 2,
      wasteFactor: 15,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    const low = cost.find(c => c.label.includes('Low'));
    const high = cost.find(c => c.label.includes('High'));
    // 2400 * $4 = $9600 low, 2400 * $7 = $16800 high
    expect(low!.value).toBe(9600);
    expect(high!.value).toBe(16800);
  });

  // ─── Test 6: Stone-coated steel type ───
  it('calculates stone-coated steel cost range', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'stone-coated',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    const low = cost.find(c => c.label.includes('Low'));
    const high = cost.find(c => c.label.includes('High'));
    // 2400 * $8 = $19200 low, 2400 * $12 = $28800 high
    expect(low!.value).toBe(19200);
    expect(high!.value).toBe(28800);
  });

  // ─── Test 7: Standing seam cost range ───
  it('calculates standing seam cost range correctly', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    const cost = result.costEstimate as Array<{ label: string; value: number }>;
    const low = cost.find(c => c.label.includes('Low'));
    const high = cost.find(c => c.label.includes('High'));
    // 2400 * $8 = $19200, 2400 * $14 = $33600
    expect(low!.value).toBe(19200);
    expect(high!.value).toBe(33600);
  });

  // ─── Test 8: Zero dimensions ───
  it('handles zero dimensions gracefully', () => {
    const result = calculateMetalRoofing({
      roofLength: 0,
      roofLengthUnit: 'ft',
      roofWidth: 0,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    expect(result.totalArea).toBe(0);
    expect(result.totalPanels).toBe(0);
    expect(result.panelsWithoutWaste).toBe(0);
    expect(result.screws).toBe(0);
    expect(result.underlayment).toBe(0);
  });

  // ─── Test 9: Metric inputs ───
  it('converts metric roof dimensions correctly', () => {
    const result = calculateMetalRoofing({
      roofLength: 12.192,    // ~40 ft
      roofLengthUnit: 'm',
      roofWidth: 9.144,      // ~30 ft
      roofWidthUnit: 'm',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    expect(result.totalArea).toBeCloseTo(2400, -1);
    expect(result.squares).toBeCloseTo(24, 0);
  });

  // ─── Test 10: Roofing squares accuracy ───
  it('calculates roofing squares as area/100', () => {
    const result = calculateMetalRoofing({
      roofLength: 50,
      roofLengthUnit: 'ft',
      roofWidth: 20,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'corrugated',
      panelWidth: 26,
      overlap: 2,
      wasteFactor: 10,
    });
    // Area = 50*20*2 = 2000, squares = 20
    expect(result.totalArea).toBe(2000);
    expect(result.squares).toBe(20);
  });

  // ─── Test 11: Ridge cap in linear feet ───
  it('calculates ridge cap as roof length in linear feet', () => {
    const result = calculateMetalRoofing({
      roofLength: 45,
      roofLengthUnit: 'ft',
      roofWidth: 25,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    expect(result.ridgeCap).toBe(45);
  });

  // ─── Test 12: Screw count (~1.5 per sq ft) ───
  it('estimates screws at 1.5 per square foot', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    // 2400 sq ft * 1.5 = 3600 screws
    expect(result.screws).toBe(3600);
  });

  // ─── Test 13: Underlayment rolls ───
  it('calculates underlayment rolls (1 per 100 sq ft)', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    // 2400 / 100 = 24 rolls
    expect(result.underlayment).toBe(24);
  });

  // ─── Test 14: Waste factor impact ───
  it('waste factor increases panel count proportionally', () => {
    const noWaste = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 0,
    });
    const withWaste = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 25,
    });
    expect(withWaste.totalPanels).toBeGreaterThan(noWaste.totalPanels as number);
    // 0% waste: panelsWithoutWaste same as totalPanels
    expect(noWaste.totalPanels).toBe(noWaste.panelsWithoutWaste);
  });

  // ─── Test 15: Large roof ───
  it('handles a large commercial roof (100×50, 2 sides)', () => {
    const result = calculateMetalRoofing({
      roofLength: 100,
      roofLengthUnit: 'ft',
      roofWidth: 50,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'r-panel',
      panelWidth: 36,
      overlap: 2,
      wasteFactor: 10,
    });
    // Area = 100*50*2 = 10000 sq ft
    expect(result.totalArea).toBe(10000);
    expect(result.squares).toBe(100);
    expect(result.ridgeCap).toBe(100);
  });

  // ─── Test 16: Small roof ───
  it('handles a small 10×8 shed roof', () => {
    const result = calculateMetalRoofing({
      roofLength: 10,
      roofLengthUnit: 'ft',
      roofWidth: 8,
      roofWidthUnit: 'ft',
      roofSides: '1',
      panelType: 'corrugated',
      panelWidth: 26,
      overlap: 2,
      wasteFactor: 15,
    });
    // Area = 10*8*1 = 80 sq ft
    expect(result.totalArea).toBe(80);
    expect(result.squares).toBe(0.8);
    expect(result.panelLength).toBe(8);
    expect(result.totalPanels).toBeGreaterThan(0);
  });

  // ─── Test 17: Trim estimate ───
  it('calculates trim linear footage', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    // Trim = 2 * 30 * 2 + 40 = 160 linear feet
    expect(result.trim).toBe(160);
  });

  // ─── Test 18: Output structure ───
  it('returns all expected output fields', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    expect(result).toHaveProperty('totalPanels');
    expect(result).toHaveProperty('panelsWithoutWaste');
    expect(result).toHaveProperty('totalArea');
    expect(result).toHaveProperty('squares');
    expect(result).toHaveProperty('ridgeCap');
    expect(result).toHaveProperty('screws');
    expect(result).toHaveProperty('underlayment');
    expect(result).toHaveProperty('trim');
    expect(result).toHaveProperty('panelLength');
    expect(result).toHaveProperty('costEstimate');
    expect(result).toHaveProperty('panelDetails');
    expect(typeof result.totalPanels).toBe('number');
    expect(typeof result.squares).toBe('number');
  });

  // ─── Test 19: Wide panels reduce panel count ───
  it('wider panels produce fewer panels per row', () => {
    const narrow = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 12,
      overlap: 1,
      wasteFactor: 0,
    });
    const wide = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 24,
      overlap: 1,
      wasteFactor: 0,
    });
    expect(wide.panelsWithoutWaste).toBeLessThan(narrow.panelsWithoutWaste as number);
  });

  // ─── Test 20: Panel details value group ───
  it('returns panel details summary', () => {
    const result = calculateMetalRoofing({
      roofLength: 40,
      roofLengthUnit: 'ft',
      roofWidth: 30,
      roofWidthUnit: 'ft',
      roofSides: '2',
      panelType: 'standing-seam',
      panelWidth: 16,
      overlap: 1,
      wasteFactor: 15,
    });
    const details = result.panelDetails as Array<{ label: string; value: number }>;
    expect(details).toHaveLength(5);
    const panelsPerRow = details.find(d => d.label.includes('Panels Per Row'));
    expect(panelsPerRow!.value).toBe(32);
    const effWidth = details.find(d => d.label.includes('Effective Panel Width'));
    expect(effWidth!.value).toBe(15);
  });
});
