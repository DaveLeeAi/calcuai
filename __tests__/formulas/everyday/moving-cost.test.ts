import { calculateMovingCost } from '@/lib/formulas/everyday/moving-cost';

describe('calculateMovingCost', () => {
  const localDefaults = {
    moveType: 'local',
    numberOfRooms: 3,
    distance: 30,
    numberOfMovers: 3,
    hourlyRate: 150,
    weightLbs: 0,
    ratePerPound: 0.50,
    packingSupplies: 200,
    insuranceFee: 150,
  };

  const longDistanceDefaults = {
    moveType: 'longDistance',
    numberOfRooms: 3,
    distance: 500,
    numberOfMovers: 3,
    hourlyRate: 150,
    weightLbs: 0,
    ratePerPound: 0.50,
    packingSupplies: 200,
    insuranceFee: 150,
  };

  // ─── Test 1: Local move default values produce reasonable total ───
  it('produces a reasonable total for a local move at defaults', () => {
    const result = calculateMovingCost(localDefaults);
    // estimatedHours = ceil(3 × 1.5) = 5
    // laborCost = 150 × 5 = 750
    // total = 750 + 200 + 150 = 1100
    expect(result.totalCost).toBe(1100);
    expect(result.laborCost).toBe(750);
    expect(result.transportCost).toBe(0);
  });

  // ─── Test 2: Long-distance move default values with auto-estimated weight ───
  it('produces a reasonable total for a long-distance move at defaults', () => {
    const result = calculateMovingCost(longDistanceDefaults);
    // estimatedWeight = 3 × 1500 = 4500
    // transportCost = 4500 × 0.50 = 2250
    // total = 0 + 2250 + 200 + 150 = 2600
    expect(result.totalCost).toBe(2600);
    expect(result.transportCost).toBe(2250);
    expect(result.laborCost).toBe(0);
    expect(result.estimatedWeight).toBe(4500);
  });

  // ─── Test 3: Long-distance move with explicit weight ───
  it('uses explicit weight when provided for long-distance', () => {
    const result = calculateMovingCost({ ...longDistanceDefaults, weightLbs: 6000 });
    // transportCost = 6000 × 0.50 = 3000
    // total = 3000 + 200 + 150 = 3350
    expect(result.totalCost).toBe(3350);
    expect(result.transportCost).toBe(3000);
    expect(result.estimatedWeight).toBe(6000);
  });

  // ─── Test 4: Studio apartment (1 room) local move ───
  it('calculates a studio move with minimum hours', () => {
    const result = calculateMovingCost({ ...localDefaults, numberOfRooms: 1 });
    // estimatedHours = max(2, ceil(1 × 1.5)) = 2
    // laborCost = 150 × 2 = 300
    // total = 300 + 200 + 150 = 650
    expect(result.estimatedHours).toBe(2);
    expect(result.laborCost).toBe(300);
    expect(result.totalCost).toBe(650);
  });

  // ─── Test 5: Large house (7 rooms) local move ───
  it('calculates a large house move', () => {
    const result = calculateMovingCost({ ...localDefaults, numberOfRooms: 7 });
    // estimatedHours = ceil(7 × 1.5) = 11
    // laborCost = 150 × 11 = 1650
    // total = 1650 + 200 + 150 = 2000
    expect(result.estimatedHours).toBe(11);
    expect(result.laborCost).toBe(1650);
    expect(result.totalCost).toBe(2000);
  });

  // ─── Test 6: Cost per room calculated correctly ───
  it('calculates cost per room as totalCost / numberOfRooms', () => {
    const result = calculateMovingCost(localDefaults);
    // total = 1100, rooms = 3 → costPerRoom = 366.67
    expect(result.costPerRoom).toBeCloseTo(1100 / 3, 2);
  });

  // ─── Test 7: Zero packing supplies and zero insurance ───
  it('works with zero packing supplies and zero insurance', () => {
    const result = calculateMovingCost({
      ...localDefaults,
      packingSupplies: 0,
      insuranceFee: 0,
    });
    // total = 750 + 0 + 0 = 750
    expect(result.suppliesCost).toBe(0);
    expect(result.insuranceCost).toBe(0);
    expect(result.totalCost).toBe(750);
  });

  // ─── Test 8: High hourly rate ($300/hr) local move ───
  it('scales with higher hourly rate', () => {
    const result = calculateMovingCost({ ...localDefaults, hourlyRate: 300 });
    // laborCost = 300 × 5 = 1500
    // total = 1500 + 200 + 150 = 1850
    expect(result.laborCost).toBe(1500);
    expect(result.totalCost).toBe(1850);
  });

  // ─── Test 9: Higher ratePerPound for long-distance ───
  it('scales with higher rate per pound', () => {
    const result = calculateMovingCost({ ...longDistanceDefaults, ratePerPound: 1.00 });
    // transportCost = 4500 × 1.00 = 4500
    // total = 4500 + 200 + 150 = 4850
    expect(result.transportCost).toBe(4500);
    expect(result.totalCost).toBe(4850);
  });

  // ─── Test 10: Local move has zero transport cost ───
  it('local move always has zero transport cost', () => {
    const result = calculateMovingCost(localDefaults);
    expect(result.transportCost).toBe(0);
    expect(result.estimatedWeight).toBe(0);
  });

  // ─── Test 11: Long-distance move has zero labor cost ───
  it('long-distance move always has zero labor cost', () => {
    const result = calculateMovingCost(longDistanceDefaults);
    expect(result.laborCost).toBe(0);
    expect(result.estimatedHours).toBe(0);
  });

  // ─── Test 12: String coercion on numeric inputs ───
  it('handles string inputs via Number() coercion', () => {
    const result = calculateMovingCost({
      ...localDefaults,
      numberOfRooms: '5' as unknown,
      hourlyRate: '200' as unknown,
      packingSupplies: '300' as unknown,
      insuranceFee: '100' as unknown,
    });
    // estimatedHours = ceil(5 × 1.5) = 8
    // laborCost = 200 × 8 = 1600
    // total = 1600 + 300 + 100 = 2000
    expect(result.estimatedHours).toBe(8);
    expect(result.laborCost).toBe(1600);
    expect(result.totalCost).toBe(2000);
  });

  // ─── Test 13: Missing/undefined inputs use defaults ───
  it('uses fallback defaults for missing inputs', () => {
    const result = calculateMovingCost({});
    // moveType defaults to 'local', numberOfRooms = 3, hourlyRate = 150
    // estimatedHours = ceil(3 × 1.5) = 5
    // laborCost = 150 × 5 = 750
    // total = 750 + 200 + 150 = 1100
    expect(result.totalCost).toBe(1100);
  });

  // ─── Test 14: Negative inputs clamped to minimums ───
  it('clamps negative inputs to minimums', () => {
    const result = calculateMovingCost({
      ...localDefaults,
      numberOfRooms: -5,
      hourlyRate: -100,
      packingSupplies: -50,
      insuranceFee: -200,
    });
    // numberOfRooms clamped to 1, hourlyRate clamped to 0
    // estimatedHours = max(2, ceil(1 × 1.5)) = 2
    // laborCost = 0 × 2 = 0
    // total = 0 + 0 + 0 = 0
    expect(result.numberOfRooms || result.estimatedHours).toBeDefined();
    expect(result.laborCost).toBe(0);
    expect(result.suppliesCost).toBe(0);
    expect(result.insuranceCost).toBe(0);
    expect(result.totalCost).toBe(0);
  });

  // ─── Test 15: Estimated hours minimum is 2 for 1-room local ───
  it('enforces minimum 2 hours for local moves', () => {
    const result = calculateMovingCost({ ...localDefaults, numberOfRooms: 1 });
    expect(result.estimatedHours).toBe(2);
  });

  // ─── Test 16: Weight auto-estimate = rooms × 1500 ───
  it('auto-estimates weight as rooms × 1500 when weightLbs is 0', () => {
    const result = calculateMovingCost({ ...longDistanceDefaults, numberOfRooms: 5, weightLbs: 0 });
    expect(result.estimatedWeight).toBe(7500);
  });

  // ─── Test 17: Large packing supplies and insurance ───
  it('handles high packing and insurance costs', () => {
    const result = calculateMovingCost({
      ...localDefaults,
      packingSupplies: 2000,
      insuranceFee: 1500,
    });
    // total = 750 + 2000 + 1500 = 4250
    expect(result.suppliesCost).toBe(2000);
    expect(result.insuranceCost).toBe(1500);
    expect(result.totalCost).toBe(4250);
  });

  // ─── Test 18: Output has all expected keys ───
  it('returns all expected output fields', () => {
    const result = calculateMovingCost(localDefaults);
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('laborCost');
    expect(result).toHaveProperty('transportCost');
    expect(result).toHaveProperty('suppliesCost');
    expect(result).toHaveProperty('insuranceCost');
    expect(result).toHaveProperty('costPerRoom');
    expect(result).toHaveProperty('estimatedHours');
    expect(result).toHaveProperty('estimatedWeight');
    expect(result).toHaveProperty('summary');
  });

  // ─── Test 19: Local summary has 3 line items ───
  it('returns a local summary with 3 cost categories', () => {
    const result = calculateMovingCost(localDefaults);
    const summary = result.summary as { label: string; value: number }[];
    expect(summary).toHaveLength(3);
    expect(summary[0].label).toBe('Labor (Crew)');
    expect(summary[1].label).toBe('Packing Supplies');
    expect(summary[2].label).toBe('Insurance');
  });

  // ─── Test 20: Long-distance summary has 3 line items ───
  it('returns a long-distance summary with 3 cost categories', () => {
    const result = calculateMovingCost(longDistanceDefaults);
    const summary = result.summary as { label: string; value: number }[];
    expect(summary).toHaveLength(3);
    expect(summary[0].label).toBe('Transport (Weight-Based)');
    expect(summary[1].label).toBe('Packing Supplies');
    expect(summary[2].label).toBe('Insurance');
  });

  // ─── Test 21: Summary values sum to total ───
  it('summary values sum to total cost (local)', () => {
    const result = calculateMovingCost(localDefaults);
    const summary = result.summary as { label: string; value: number }[];
    const sum = summary.reduce((acc, item) => acc + item.value, 0);
    expect(sum).toBeCloseTo(result.totalCost as number, 2);
  });

  // ─── Test 22: Summary values sum to total (long-distance) ───
  it('summary values sum to total cost (long-distance)', () => {
    const result = calculateMovingCost(longDistanceDefaults);
    const summary = result.summary as { label: string; value: number }[];
    const sum = summary.reduce((acc, item) => acc + item.value, 0);
    expect(sum).toBeCloseTo(result.totalCost as number, 2);
  });

  // ─── Test 23: 4-bedroom house (7 rooms) long-distance ───
  it('calculates a 4BR long-distance move correctly', () => {
    const result = calculateMovingCost({ ...longDistanceDefaults, numberOfRooms: 7 });
    // estimatedWeight = 7 × 1500 = 10500
    // transportCost = 10500 × 0.50 = 5250
    // total = 5250 + 200 + 150 = 5600
    expect(result.estimatedWeight).toBe(10500);
    expect(result.transportCost).toBe(5250);
    expect(result.totalCost).toBe(5600);
  });

  // ─── Test 24: Boundary — 2 rooms local ───
  it('calculates hours correctly for 2-room local move', () => {
    const result = calculateMovingCost({ ...localDefaults, numberOfRooms: 2 });
    // estimatedHours = max(2, ceil(2 × 1.5)) = max(2, 3) = 3
    expect(result.estimatedHours).toBe(3);
    // laborCost = 150 × 3 = 450
    expect(result.laborCost).toBe(450);
  });

  // ─── Test 25: Very heavy long-distance shipment ───
  it('handles a very heavy shipment (40,000 lbs)', () => {
    const result = calculateMovingCost({
      ...longDistanceDefaults,
      weightLbs: 40000,
      ratePerPound: 0.60,
    });
    // transportCost = 40000 × 0.60 = 24000
    // total = 24000 + 200 + 150 = 24350
    expect(result.transportCost).toBe(24000);
    expect(result.totalCost).toBe(24350);
  });
});
