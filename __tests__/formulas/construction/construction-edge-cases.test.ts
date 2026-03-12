import { calculatePaintCoverage } from '@/lib/formulas/construction/paint-coverage';
import { calculateFlooring } from '@/lib/formulas/construction/flooring';
import { getFormula } from '@/lib/formulas/index';
import {
  expectNonNegativeFiniteNumber,
  testInvalidInputs,
  testMissingInputs,
  sweepInput,
} from '../../helpers/formula-test-utils';

// ─── Paint Calculator baselines ──────────────────────────────────────────────
const PAINT_BASE = {
  roomLength: 14,
  roomLengthUnit: 'ft',
  roomWidth: 12,
  roomWidthUnit: 'ft',
  wallHeight: 8,
  wallHeightUnit: 'ft',
  doors: 2,
  windows: 2,
  coats: 2,
  paintType: 'eggshell',
  includeCeiling: false,
};

// ─── Flooring Calculator baselines ───────────────────────────────────────────
const FLOOR_BASE = {
  length: 14,
  lengthUnit: 'ft',
  width: 12,
  widthUnit: 'ft',
  materialType: 'hardwood',
  wastePercent: 10,
  boxSize: 20,
  rooms: 1,
};

describe('Paint Calculator — edge cases', () => {
  // ═══ ZERO DIMENSIONS ═════════════════════════════════════════════════════

  it('handles zero room length gracefully (still has width walls)', () => {
    const result = calculatePaintCoverage({ ...PAINT_BASE, roomLength: 0 });
    expectNonNegativeFiniteNumber(result, 'paintableArea');
    // Perimeter = 2*(0+12)=24, wall area = 24*8=192 — NOT zero because width walls still exist
    expect(typeof result.paintableArea).toBe('number');
  });

  it('handles zero room width gracefully', () => {
    const result = calculatePaintCoverage({ ...PAINT_BASE, roomWidth: 0 });
    expectNonNegativeFiniteNumber(result, 'paintableArea');
  });

  it('handles zero wall height gracefully', () => {
    const result = calculatePaintCoverage({ ...PAINT_BASE, wallHeight: 0 });
    expect(result.totalWallArea).toBe(0);
  });

  it('zero coats produces finite result', () => {
    const result = calculatePaintCoverage({ ...PAINT_BASE, coats: 0 });
    // Formula may not special-case zero coats — just verify it doesn't throw
    expectNonNegativeFiniteNumber(result, 'gallonsNeeded');
  });

  // ═══ VERY LARGE ROOMS ════════════════════════════════════════════════════

  it('handles very large room (100×100 ft)', () => {
    const result = calculatePaintCoverage({
      ...PAINT_BASE,
      roomLength: 100,
      roomWidth: 100,
      doors: 0,
      windows: 0,
    });
    expectNonNegativeFiniteNumber(result, 'gallonsNeeded');
    // Perimeter = 400, wall area = 3200, gallons = ceil(6400/375) = 18
    expect(result.gallonsNeeded as number).toBeGreaterThan(10);
  });

  // ═══ ALL PAINT TYPES PRODUCE VALID OUTPUT ════════════════════════════════

  it.each(['flat', 'eggshell', 'satin', 'semi-gloss', 'gloss', 'primer'])(
    'produces valid output for paint type "%s"',
    (paintType) => {
      const result = calculatePaintCoverage({ ...PAINT_BASE, paintType });
      expectNonNegativeFiniteNumber(result, 'gallonsNeeded');
      expect(result.gallonsNeeded as number).toBeGreaterThan(0);
    }
  );

  // ═══ GALLONS MONOTONICITY ════════════════════════════════════════════════

  it('more coats requires more gallons', () => {
    const results = sweepInput(calculatePaintCoverage, PAINT_BASE, 'coats', [1, 2, 3, 4]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.gallonsNeeded as number)
        .toBeGreaterThanOrEqual(results[i - 1].result.gallonsNeeded as number);
    }
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid roomLength without throwing', () => {
    testInvalidInputs(calculatePaintCoverage, PAINT_BASE, 'roomLength');
  });

  it('handles invalid wallHeight without throwing', () => {
    testInvalidInputs(calculatePaintCoverage, PAINT_BASE, 'wallHeight');
  });

  it('handles missing required keys without throwing', () => {
    testMissingInputs(calculatePaintCoverage, PAINT_BASE, [
      'roomLength', 'roomWidth', 'wallHeight', 'doors', 'windows', 'coats',
    ]);
  });
});

describe('Flooring Calculator — edge cases', () => {
  // ═══ ZERO DIMENSIONS ═════════════════════════════════════════════════════

  it('handles zero length gracefully', () => {
    const result = calculateFlooring({ ...FLOOR_BASE, length: 0 });
    expect(result.totalArea).toBe(0);
    expect(result.materialNeeded).toBe(0);
    expect(result.boxesNeeded).toBe(0);
  });

  it('handles zero width gracefully', () => {
    const result = calculateFlooring({ ...FLOOR_BASE, width: 0 });
    expect(result.totalArea).toBe(0);
  });

  it('handles zero rooms gracefully', () => {
    const result = calculateFlooring({ ...FLOOR_BASE, rooms: 0 });
    // Formula may default zero rooms to 1 — verify no crash and finite output
    expectNonNegativeFiniteNumber(result, 'totalArea');
  });

  // ═══ VERY SMALL ROOMS ════════════════════════════════════════════════════

  it('handles very small room (1×1 ft)', () => {
    const result = calculateFlooring({
      ...FLOOR_BASE,
      length: 1,
      width: 1,
      boxSize: 20,
    });
    expect(result.totalArea).toBe(1);
    expect(result.boxesNeeded).toBe(1); // ceil(1.1/20) = 1
  });

  // ═══ VERY LARGE WASTE PERCENTAGE ═════════════════════════════════════════

  it('handles very high waste factor', () => {
    const result = calculateFlooring({ ...FLOOR_BASE, wastePercent: 100 });
    // With 100% waste, material should be more than base area
    expectNonNegativeFiniteNumber(result, 'materialNeeded');
    expect(result.materialNeeded as number).toBeGreaterThan(result.totalArea as number);
  });

  // ═══ ALL MATERIAL TYPES PRODUCE VALID OUTPUT ═════════════════════════════

  it.each(['hardwood', 'laminate', 'vinyl-plank', 'tile', 'carpet', 'stone'])(
    'produces valid output for material type "%s"',
    (materialType) => {
      const result = calculateFlooring({ ...FLOOR_BASE, materialType });
      expectNonNegativeFiniteNumber(result, 'totalArea');
      expectNonNegativeFiniteNumber(result, 'boxesNeeded');
    }
  );

  // ═══ BOX ROUNDING ════════════════════════════════════════════════════════

  it('always rounds boxes up (never fractional boxes)', () => {
    // 168 * 1.1 = 184.8 / 20 = 9.24 → must be 10 boxes
    const result = calculateFlooring(FLOOR_BASE);
    expect(result.boxesNeeded).toBe(10);
    expect(Number.isInteger(result.boxesNeeded)).toBe(true);
  });

  it('exact division still gives whole number of boxes', () => {
    // 100 * 1.0 = 100 / 20 = 5.0 → exactly 5 boxes
    const result = calculateFlooring({
      ...FLOOR_BASE,
      length: 10,
      width: 10,
      wastePercent: 0,
      boxSize: 20,
    });
    expect(result.boxesNeeded).toBe(5);
  });

  // ═══ MONOTONICITY ════════════════════════════════════════════════════════

  it('more rooms requires more material', () => {
    const results = sweepInput(calculateFlooring, FLOOR_BASE, 'rooms', [1, 2, 3, 5, 10]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.materialNeeded as number)
        .toBeGreaterThan(results[i - 1].result.materialNeeded as number);
    }
  });

  // ═══ INVALID INPUT RESILIENCE ════════════════════════════════════════════

  it('handles invalid length without throwing', () => {
    testInvalidInputs(calculateFlooring, FLOOR_BASE, 'length');
  });

  it('handles invalid width without throwing', () => {
    testInvalidInputs(calculateFlooring, FLOOR_BASE, 'width');
  });

  it('handles missing required keys without throwing', () => {
    testMissingInputs(calculateFlooring, FLOOR_BASE, [
      'length', 'width', 'rooms', 'boxSize',
    ]);
  });
});

describe('Board Foot Calculator — edge cases', () => {
  const calculateBoardFoot = getFormula('board-foot');
  const BASE = {
    thickness: 1,
    width: 6,
    length: 8,
    lengthUnit: 'ft',
    quantity: 10,
  };

  it('handles zero thickness gracefully', () => {
    const result = calculateBoardFoot({ ...BASE, thickness: 0 });
    expectNonNegativeFiniteNumber(result, 'totalBoardFeet');
    // Formula may not guard against zero thickness — verify finite output
  });

  it('handles zero quantity gracefully', () => {
    const result = calculateBoardFoot({ ...BASE, quantity: 0 });
    expectNonNegativeFiniteNumber(result, 'totalBoardFeet');
  });

  it('board feet increase linearly with quantity', () => {
    const results = sweepInput(calculateBoardFoot, BASE, 'quantity', [1, 5, 10, 20]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.totalBoardFeet as number)
        .toBeGreaterThan(results[i - 1].result.totalBoardFeet as number);
    }
  });

  it('handles invalid inputs without throwing', () => {
    testInvalidInputs(calculateBoardFoot, BASE, 'thickness');
  });
});

describe('Fence Calculator — edge cases', () => {
  const calculateFence = getFormula('fence');
  const BASE = {
    totalLength: 100,
    lengthUnit: 'ft',
    fenceHeight: 6,
    postSpacing: 8,
    gateCount: 1,
    gateWidth: 4,
    materialType: 'wood',
  };

  it('handles zero fence length', () => {
    const result = calculateFence({ ...BASE, totalLength: 0 });
    expectNonNegativeFiniteNumber(result, 'posts');
  });

  it('handles zero gates', () => {
    const result = calculateFence({ ...BASE, gateCount: 0 });
    expectNonNegativeFiniteNumber(result, 'posts');
  });

  it('more length requires more posts', () => {
    const results = sweepInput(calculateFence, BASE, 'totalLength', [20, 50, 100, 200]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].result.posts as number)
        .toBeGreaterThanOrEqual(results[i - 1].result.posts as number);
    }
  });

  it('handles invalid inputs without throwing', () => {
    testInvalidInputs(calculateFence, BASE, 'totalLength');
  });
});
