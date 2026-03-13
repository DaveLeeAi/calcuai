import { calculateTripCost } from '@/lib/formulas/everyday/trip-cost';

describe('calculateTripCost', () => {
  const defaults = {
    distance: 600,
    fuelEfficiency: 28,
    fuelPrice: 3.50,
    nights: 3,
    hotelPerNight: 150,
    mealsPerDay: 3,
    mealCost: 15,
    travelers: 2,
    activitiesBudget: 200,
    miscBudget: 100,
  };

  // ─── Test 1: Default values produce reasonable total ───
  it('produces a reasonable total at default values', () => {
    const result = calculateTripCost(defaults);
    // fuel = 600/28 × 3.50 = 75, lodging = 450, food = 3×15×2×4 = 360, activities = 200, misc = 100
    // total = 75 + 450 + 360 + 200 + 100 = 1185
    expect(result.totalTripCost).toBeCloseTo(1185, 0);
    expect(result.totalTripCost).toBeGreaterThan(500);
    expect(result.totalTripCost).toBeLessThan(5000);
  });

  // ─── Test 2: Day trip (0 nights) ───
  it('calculates a day trip with 0 nights', () => {
    const result = calculateTripCost({ ...defaults, nights: 0, hotelPerNight: 150 });
    expect(result.lodgingCost).toBe(0);
    // days = 1, food = 3 × 15 × 2 × 1 = 90
    expect(result.foodCost).toBe(90);
  });

  // ─── Test 3: Long vacation (14 nights) ───
  it('calculates a long vacation', () => {
    const result = calculateTripCost({ ...defaults, nights: 14 });
    expect(result.lodgingCost).toBe(2100); // 14 × 150
    // days = 15, food = 3 × 15 × 2 × 15 = 1350
    expect(result.foodCost).toBe(1350);
  });

  // ─── Test 4: Solo traveler ───
  it('calculates for a solo traveler', () => {
    const result = calculateTripCost({ ...defaults, travelers: 1 });
    expect(result.costPerPerson).toBe(result.totalTripCost);
    // Food: 3 × 15 × 1 × 4 = 180
    expect(result.foodCost).toBe(180);
  });

  // ─── Test 5: Large group (6 travelers) ───
  it('calculates for a large group', () => {
    const result = calculateTripCost({ ...defaults, travelers: 6 });
    // Food: 3 × 15 × 6 × 4 = 1080
    expect(result.foodCost).toBe(1080);
    expect(result.costPerPerson).toBeCloseTo((result.totalTripCost as number) / 6, 2);
  });

  // ─── Test 6: No activities or misc budget ───
  it('works without activities or miscellaneous budget', () => {
    const result = calculateTripCost({ ...defaults, activitiesBudget: 0, miscBudget: 0 });
    expect(result.activityCost).toBe(0);
    expect(result.miscCost).toBe(0);
    expect(result.totalTripCost).toBeLessThan(
      (calculateTripCost(defaults).totalTripCost as number)
    );
  });

  // ─── Test 7: Expensive hotel ($300/night) ───
  it('increases total with expensive hotel', () => {
    const result = calculateTripCost({ ...defaults, hotelPerNight: 300 });
    expect(result.lodgingCost).toBe(900); // 3 × 300
  });

  // ─── Test 8: Budget trip ───
  it('calculates a budget trip', () => {
    const result = calculateTripCost({
      ...defaults,
      hotelPerNight: 60,
      mealCost: 8,
      activitiesBudget: 50,
      miscBudget: 25,
    });
    expect(result.lodgingCost).toBe(180);
    expect(result.foodCost).toBe(192); // 3 × 8 × 2 × 4
    expect(result.totalTripCost).toBeLessThan(600);
  });

  // ─── Test 9: Long distance (2000 miles) ───
  it('calculates fuel for a long distance trip', () => {
    const result = calculateTripCost({ ...defaults, distance: 2000 });
    // fuel = 2000/28 × 3.50 = 250.00
    expect(result.fuelCost).toBeCloseTo(250, 0);
  });

  // ─── Test 10: Short distance (50 miles) ───
  it('calculates fuel for a short distance trip', () => {
    const result = calculateTripCost({ ...defaults, distance: 50 });
    // fuel = 50/28 × 3.50 = 6.25
    expect(result.fuelCost).toBeCloseTo(6.25, 2);
  });

  // ─── Test 11: High fuel price ($5/gal) ───
  it('increases fuel cost with higher gas price', () => {
    const result = calculateTripCost({ ...defaults, fuelPrice: 5.00 });
    // fuel = 600/28 × 5.00 = 107.14
    expect(result.fuelCost).toBeCloseTo(107.14, 1);
  });

  // ─── Test 12: Fuel-efficient car (40 MPG) ───
  it('reduces fuel cost with better fuel efficiency', () => {
    const result = calculateTripCost({ ...defaults, fuelEfficiency: 40 });
    // fuel = 600/40 × 3.50 = 52.50
    expect(result.fuelCost).toBeCloseTo(52.50, 2);
  });

  // ─── Test 13: Gas guzzler (15 MPG) ───
  it('increases fuel cost with poor fuel efficiency', () => {
    const result = calculateTripCost({ ...defaults, fuelEfficiency: 15 });
    // fuel = 600/15 × 3.50 = 140.00
    expect(result.fuelCost).toBeCloseTo(140.00, 2);
  });

  // ─── Test 14: No meals (0 per day) ───
  it('handles zero meals per day', () => {
    const result = calculateTripCost({ ...defaults, mealsPerDay: 0 });
    expect(result.foodCost).toBe(0);
  });

  // ─── Test 15: Expensive meals ($50/meal) ───
  it('increases food cost with expensive meals', () => {
    const result = calculateTripCost({ ...defaults, mealCost: 50 });
    // food = 3 × 50 × 2 × 4 = 1200
    expect(result.foodCost).toBe(1200);
  });

  // ─── Test 16: Cost per person = total / travelers ───
  it('calculates cost per person correctly', () => {
    const result = calculateTripCost(defaults);
    expect(result.costPerPerson).toBeCloseTo(
      (result.totalTripCost as number) / 2, 2
    );
  });

  // ─── Test 17: Fuel cost = distance / MPG × price ───
  it('calculates fuel cost with correct formula', () => {
    const result = calculateTripCost(defaults);
    const expectedFuel = parseFloat(((600 / 28) * 3.50).toFixed(2));
    expect(result.fuelCost).toBeCloseTo(expectedFuel, 2);
  });

  // ─── Test 18: Lodging = nights × rate ───
  it('calculates lodging cost correctly', () => {
    const result = calculateTripCost(defaults);
    expect(result.lodgingCost).toBe(450); // 3 × 150
  });

  // ─── Test 19: Food = meals × cost × travelers × days ───
  it('calculates food cost correctly', () => {
    const result = calculateTripCost(defaults);
    // days = 3 + 1 = 4, food = 3 × 15 × 2 × 4 = 360
    expect(result.foodCost).toBe(360);
  });

  // ─── Test 20: Output has all expected keys ───
  it('returns all expected output fields', () => {
    const result = calculateTripCost(defaults);
    expect(result).toHaveProperty('totalTripCost');
    expect(result).toHaveProperty('costPerPerson');
    expect(result).toHaveProperty('fuelCost');
    expect(result).toHaveProperty('lodgingCost');
    expect(result).toHaveProperty('foodCost');
    expect(result).toHaveProperty('activityCost');
    expect(result).toHaveProperty('miscCost');
    expect(result).toHaveProperty('costPerDay');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 21: Cost breakdown array present ───
  it('returns a cost breakdown with 5 categories', () => {
    const result = calculateTripCost(defaults);
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(5);
    expect(breakdown[0].label).toBe('Fuel');
    expect(breakdown[1].label).toBe('Lodging');
    expect(breakdown[2].label).toBe('Food');
    expect(breakdown[3].label).toBe('Activities');
    expect(breakdown[4].label).toBe('Miscellaneous');
  });

  // ─── Test 22: Zero distance = zero fuel cost ───
  it('returns zero fuel cost with zero distance', () => {
    const result = calculateTripCost({ ...defaults, distance: 0 });
    expect(result.fuelCost).toBe(0);
    // Other costs should still be calculated
    expect(result.lodgingCost).toBe(450);
  });

  // ─── Test 23: Cost per day calculation ───
  it('calculates cost per day as total / days', () => {
    const result = calculateTripCost(defaults);
    // days = 4
    expect(result.costPerDay).toBeCloseTo((result.totalTripCost as number) / 4, 2);
  });

  // ─── Test 24: Breakdown values sum to total ───
  it('breakdown values sum to total trip cost', () => {
    const result = calculateTripCost(defaults);
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    const sum = breakdown.reduce((acc, item) => acc + item.value, 0);
    expect(sum).toBeCloseTo(result.totalTripCost as number, 2);
  });
});
