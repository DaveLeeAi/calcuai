import { calculateSlope } from '@/lib/formulas/math/slope';

describe('calculateSlope', () => {
  // ═══════════════════════════════════════════════════════
  // Basic slope calculations
  // ═══════════════════════════════════════════════════════

  it('slope of (0,0) to (4,8) = 2', () => {
    const result = calculateSlope({ x1: 0, y1: 0, x2: 4, y2: 8 });
    expect(result.slope).toBe(2);
    expect(result.yIntercept).toBe(0);
  });

  it('slope of (1,2) to (3,8) = 3', () => {
    const result = calculateSlope({ x1: 1, y1: 2, x2: 3, y2: 8 });
    expect(result.slope).toBe(3);
    expect(result.yIntercept).toBe(-1);
  });

  it('slope of (2,5) to (6,3) = -0.5', () => {
    const result = calculateSlope({ x1: 2, y1: 5, x2: 6, y2: 3 });
    expect(result.slope).toBe(-0.5);
  });

  it('slope of (-3,-2) to (5,6) = 1', () => {
    const result = calculateSlope({ x1: -3, y1: -2, x2: 5, y2: 6 });
    expect(result.slope).toBe(1);
    expect(result.yIntercept).toBe(1);
  });

  // ═══════════════════════════════════════════════════════
  // Horizontal and vertical lines
  // ═══════════════════════════════════════════════════════

  it('horizontal line: (0,5) to (10,5) → slope = 0', () => {
    const result = calculateSlope({ x1: 0, y1: 5, x2: 10, y2: 5 });
    expect(result.slope).toBe(0);
    expect(result.isHorizontal).toBe(true);
    expect(result.isVertical).toBe(false);
  });

  it('vertical line: (3,0) to (3,10) → slope undefined', () => {
    const result = calculateSlope({ x1: 3, y1: 0, x2: 3, y2: 10 });
    expect(result.slope).toBeNull();
    expect(result.isVertical).toBe(true);
    expect(result.isHorizontal).toBe(false);
    expect(result.equation).toBe('x = 3');
  });

  // ═══════════════════════════════════════════════════════
  // Distance calculation
  // ═══════════════════════════════════════════════════════

  it('distance from (0,0) to (3,4) = 5', () => {
    const result = calculateSlope({ x1: 0, y1: 0, x2: 3, y2: 4 });
    expect(result.distance).toBe(5);
  });

  it('distance from (1,1) to (4,5) = 5', () => {
    const result = calculateSlope({ x1: 1, y1: 1, x2: 4, y2: 5 });
    expect(result.distance).toBe(5);
  });

  it('distance between same point is 0', () => {
    const result = calculateSlope({ x1: 5, y1: 5, x2: 5, y2: 5 });
    expect(result.distance).toBe(0);
  });

  // ═══════════════════════════════════════════════════════
  // Y-intercept
  // ═══════════════════════════════════════════════════════

  it('y = 2x + 3: points (0,3) to (2,7)', () => {
    const result = calculateSlope({ x1: 0, y1: 3, x2: 2, y2: 7 });
    expect(result.slope).toBe(2);
    expect(result.yIntercept).toBe(3);
    expect(result.equation).toBe('y = 2x + 3');
  });

  it('y = -x + 5: points (0,5) to (5,0)', () => {
    const result = calculateSlope({ x1: 0, y1: 5, x2: 5, y2: 0 });
    expect(result.slope).toBe(-1);
    expect(result.yIntercept).toBe(5);
  });

  // ═══════════════════════════════════════════════════════
  // Midpoint
  // ═══════════════════════════════════════════════════════

  it('midpoint of (0,0) to (10,10) is (5,5)', () => {
    const result = calculateSlope({ x1: 0, y1: 0, x2: 10, y2: 10 });
    expect(result.midpointX).toBe(5);
    expect(result.midpointY).toBe(5);
  });

  it('midpoint of (-4,2) to (6,8) is (1,5)', () => {
    const result = calculateSlope({ x1: -4, y1: 2, x2: 6, y2: 8 });
    expect(result.midpointX).toBe(1);
    expect(result.midpointY).toBe(5);
  });

  // ═══════════════════════════════════════════════════════
  // Angle
  // ═══════════════════════════════════════════════════════

  it('45-degree slope: (0,0) to (1,1) → angle = 45°', () => {
    const result = calculateSlope({ x1: 0, y1: 0, x2: 1, y2: 1 });
    expect(result.angle).toBeCloseTo(45, 4);
  });

  it('negative slope: (0,0) to (1,-1) → angle = -45°', () => {
    const result = calculateSlope({ x1: 0, y1: 0, x2: 1, y2: -1 });
    expect(result.angle).toBeCloseTo(-45, 4);
  });

  it('vertical line angle is 90°', () => {
    const result = calculateSlope({ x1: 0, y1: 0, x2: 0, y2: 5 });
    expect(result.angle).toBe(90);
  });

  // ═══════════════════════════════════════════════════════
  // Delta values
  // ═══════════════════════════════════════════════════════

  it('returns correct deltaX and deltaY', () => {
    const result = calculateSlope({ x1: 2, y1: 3, x2: 7, y2: 11 });
    expect(result.deltaX).toBe(5);
    expect(result.deltaY).toBe(8);
  });

  // ═══════════════════════════════════════════════════════
  // Decimal coordinates
  // ═══════════════════════════════════════════════════════

  it('handles decimal coordinates: (0.5, 1.5) to (2.5, 5.5)', () => {
    const result = calculateSlope({ x1: 0.5, y1: 1.5, x2: 2.5, y2: 5.5 });
    expect(result.slope).toBe(2);
  });
});
