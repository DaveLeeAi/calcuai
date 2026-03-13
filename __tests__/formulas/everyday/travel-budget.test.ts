import { calculateTravelBudget } from '@/lib/formulas/everyday/travel-budget';

describe('calculateTravelBudget', () => {
  const defaults = {
    travelers: 2,
    nights: 7,
    flightCost: 800,
    accommodationPerNight: 150,
    dailyFoodBudget: 60,
    dailyActivityBudget: 40,
    dailyTransportBudget: 20,
    shoppingBudget: 200,
    travelInsurance: 0,
  };

  // ─── Test 1: Default values produce correct total ───
  it('produces the correct total at default values', () => {
    const result = calculateTravelBudget(defaults);
    // days = 8
    // accommodation = 7 × 150 = 1050
    // food = 8 × 60 × 2 = 960
    // activities = 8 × 40 × 2 = 640
    // transport = 8 × 20 = 160
    // total = 800 + 1050 + 960 + 640 + 160 + 200 + 0 = 3810
    expect(result.totalTripCost).toBeCloseTo(3810, 2);
  });

  // ─── Test 2: Days = nights + 1 ───
  it('calculates days as nights + 1', () => {
    const result = calculateTravelBudget(defaults);
    expect(result.days).toBe(8);
  });

  // ─── Test 3: Accommodation total ───
  it('calculates accommodation total correctly', () => {
    const result = calculateTravelBudget(defaults);
    expect(result.accommodationTotal).toBe(1050); // 7 × 150
  });

  // ─── Test 4: Food total ───
  it('calculates food total correctly', () => {
    const result = calculateTravelBudget(defaults);
    // 8 days × $60 × 2 travelers = 960
    expect(result.foodTotal).toBe(960);
  });

  // ─── Test 5: Activity total ───
  it('calculates activity total correctly', () => {
    const result = calculateTravelBudget(defaults);
    // 8 days × $40 × 2 travelers = 640
    expect(result.activityTotal).toBe(640);
  });

  // ─── Test 6: Transport total ───
  it('calculates local transport total correctly', () => {
    const result = calculateTravelBudget(defaults);
    // 8 days × $20 = 160
    expect(result.transportTotal).toBe(160);
  });

  // ─── Test 7: Cost per person ───
  it('calculates cost per person correctly', () => {
    const result = calculateTravelBudget(defaults);
    expect(result.costPerPerson).toBeCloseTo(
      (result.totalTripCost as number) / 2, 2
    );
  });

  // ─── Test 8: Cost per day ───
  it('calculates cost per day correctly', () => {
    const result = calculateTravelBudget(defaults);
    // total / 8 days
    expect(result.costPerDay).toBeCloseTo(
      (result.totalTripCost as number) / 8, 2
    );
  });

  // ─── Test 9: Solo traveler ───
  it('calculates for a solo traveler', () => {
    const result = calculateTravelBudget({ ...defaults, travelers: 1 });
    expect(result.costPerPerson).toBe(result.totalTripCost);
    // food = 8 × 60 × 1 = 480
    expect(result.foodTotal).toBe(480);
    // activities = 8 × 40 × 1 = 320
    expect(result.activityTotal).toBe(320);
  });

  // ─── Test 10: Large group (10 travelers) ───
  it('calculates for a large group', () => {
    const result = calculateTravelBudget({ ...defaults, travelers: 10 });
    // food = 8 × 60 × 10 = 4800
    expect(result.foodTotal).toBe(4800);
    // activities = 8 × 40 × 10 = 3200
    expect(result.activityTotal).toBe(3200);
    // transport still = 160 (group level)
    expect(result.transportTotal).toBe(160);
    expect(result.costPerPerson).toBeCloseTo(
      (result.totalTripCost as number) / 10, 2
    );
  });

  // ─── Test 11: Weekend trip (2 nights) ───
  it('calculates a short weekend trip', () => {
    const result = calculateTravelBudget({ ...defaults, nights: 2 });
    // days = 3
    expect(result.days).toBe(3);
    expect(result.accommodationTotal).toBe(300); // 2 × 150
    expect(result.foodTotal).toBe(360); // 3 × 60 × 2
    expect(result.activityTotal).toBe(240); // 3 × 40 × 2
    expect(result.transportTotal).toBe(60); // 3 × 20
  });

  // ─── Test 12: Long trip (30 nights) ───
  it('calculates a long trip', () => {
    const result = calculateTravelBudget({ ...defaults, nights: 30 });
    // days = 31
    expect(result.days).toBe(31);
    expect(result.accommodationTotal).toBe(4500); // 30 × 150
    expect(result.foodTotal).toBe(3720); // 31 × 60 × 2
  });

  // ─── Test 13: Zero optional budgets ───
  it('works with zero optional budgets', () => {
    const result = calculateTravelBudget({
      ...defaults,
      dailyActivityBudget: 0,
      dailyTransportBudget: 0,
      shoppingBudget: 0,
      travelInsurance: 0,
    });
    expect(result.activityTotal).toBe(0);
    expect(result.transportTotal).toBe(0);
    expect(result.shoppingBudget).toBe(0);
    expect(result.travelInsurance).toBe(0);
    // total = 800 + 1050 + 960 = 2810
    expect(result.totalTripCost).toBeCloseTo(2810, 2);
  });

  // ─── Test 14: Luxury budget ───
  it('calculates a luxury trip', () => {
    const result = calculateTravelBudget({
      travelers: 2,
      nights: 7,
      flightCost: 4000,
      accommodationPerNight: 500,
      dailyFoodBudget: 200,
      dailyActivityBudget: 150,
      dailyTransportBudget: 80,
      shoppingBudget: 1000,
      travelInsurance: 350,
    });
    // accommodation = 7 × 500 = 3500
    // food = 8 × 200 × 2 = 3200
    // activities = 8 × 150 × 2 = 2400
    // transport = 8 × 80 = 640
    // total = 4000 + 3500 + 3200 + 2400 + 640 + 1000 + 350 = 15090
    expect(result.totalTripCost).toBeCloseTo(15090, 2);
    expect(result.costPerPerson).toBeCloseTo(7545, 2);
  });

  // ─── Test 15: Zero flight cost ───
  it('handles zero flight cost (road trip)', () => {
    const result = calculateTravelBudget({ ...defaults, flightCost: 0 });
    expect(result.flightCost).toBe(0);
    // total = 0 + 1050 + 960 + 640 + 160 + 200 + 0 = 3010
    expect(result.totalTripCost).toBeCloseTo(3010, 2);
  });

  // ─── Test 16: With travel insurance ───
  it('includes travel insurance in total', () => {
    const result = calculateTravelBudget({ ...defaults, travelInsurance: 250 });
    expect(result.travelInsurance).toBe(250);
    // total = 3810 + 250 = 4060
    expect(result.totalTripCost).toBeCloseTo(4060, 2);
  });

  // ─── Test 17: Budget trip ───
  it('calculates a budget trip', () => {
    const result = calculateTravelBudget({
      travelers: 1,
      nights: 5,
      flightCost: 200,
      accommodationPerNight: 40,
      dailyFoodBudget: 25,
      dailyActivityBudget: 10,
      dailyTransportBudget: 5,
      shoppingBudget: 50,
      travelInsurance: 0,
    });
    // days = 6
    // accommodation = 5 × 40 = 200
    // food = 6 × 25 × 1 = 150
    // activities = 6 × 10 × 1 = 60
    // transport = 6 × 5 = 30
    // total = 200 + 200 + 150 + 60 + 30 + 50 + 0 = 690
    expect(result.totalTripCost).toBeCloseTo(690, 2);
    expect(result.costPerDay).toBeCloseTo(115, 2);
  });

  // ─── Test 18: Breakdown structure ───
  it('returns a cost breakdown with 7 categories', () => {
    const result = calculateTravelBudget(defaults);
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    expect(breakdown).toHaveLength(7);
    expect(breakdown[0].label).toBe('Flights/Transport');
    expect(breakdown[1].label).toBe('Accommodation');
    expect(breakdown[2].label).toBe('Food');
    expect(breakdown[3].label).toBe('Activities');
    expect(breakdown[4].label).toBe('Local Transport');
    expect(breakdown[5].label).toBe('Shopping & Souvenirs');
    expect(breakdown[6].label).toBe('Travel Insurance');
  });

  // ─── Test 19: Breakdown values sum to total ───
  it('breakdown values sum to total trip cost', () => {
    const result = calculateTravelBudget(defaults);
    const breakdown = result.costBreakdown as { label: string; value: number }[];
    const sum = breakdown.reduce((acc, item) => acc + item.value, 0);
    expect(sum).toBeCloseTo(result.totalTripCost as number, 2);
  });

  // ─── Test 20: Output has all expected keys ───
  it('returns all expected output fields', () => {
    const result = calculateTravelBudget(defaults);
    expect(result).toHaveProperty('totalTripCost');
    expect(result).toHaveProperty('costPerPerson');
    expect(result).toHaveProperty('costPerDay');
    expect(result).toHaveProperty('accommodationTotal');
    expect(result).toHaveProperty('foodTotal');
    expect(result).toHaveProperty('activityTotal');
    expect(result).toHaveProperty('transportTotal');
    expect(result).toHaveProperty('flightCost');
    expect(result).toHaveProperty('shoppingBudget');
    expect(result).toHaveProperty('travelInsurance');
    expect(result).toHaveProperty('days');
    expect(result).toHaveProperty('costBreakdown');
  });

  // ─── Test 21: Minimum nights (1 night) ───
  it('handles minimum 1 night stay', () => {
    const result = calculateTravelBudget({ ...defaults, nights: 1 });
    expect(result.days).toBe(2);
    expect(result.accommodationTotal).toBe(150); // 1 × 150
    expect(result.foodTotal).toBe(240); // 2 × 60 × 2
  });

  // ─── Test 22: Expensive accommodation ───
  it('handles expensive accommodation', () => {
    const result = calculateTravelBudget({ ...defaults, accommodationPerNight: 500 });
    expect(result.accommodationTotal).toBe(3500); // 7 × 500
    // total = 800 + 3500 + 960 + 640 + 160 + 200 + 0 = 6260
    expect(result.totalTripCost).toBeCloseTo(6260, 2);
  });

  // ─── Test 23: Free accommodation (staying with friends) ───
  it('handles zero accommodation cost', () => {
    const result = calculateTravelBudget({ ...defaults, accommodationPerNight: 0 });
    expect(result.accommodationTotal).toBe(0);
    // total = 800 + 0 + 960 + 640 + 160 + 200 + 0 = 2760
    expect(result.totalTripCost).toBeCloseTo(2760, 2);
  });

  // ─── Test 24: Zero food budget (all-inclusive resort) ───
  it('handles zero food budget', () => {
    const result = calculateTravelBudget({ ...defaults, dailyFoodBudget: 0 });
    expect(result.foodTotal).toBe(0);
  });

  // ─── Test 25: Large shopping budget ───
  it('includes large shopping budget', () => {
    const result = calculateTravelBudget({ ...defaults, shoppingBudget: 2000 });
    expect(result.shoppingBudget).toBe(2000);
    // total = 800 + 1050 + 960 + 640 + 160 + 2000 + 0 = 5610
    expect(result.totalTripCost).toBeCloseTo(5610, 2);
  });

  // ─── Test 26: Missing inputs use defaults ───
  it('uses safe defaults for missing inputs', () => {
    const result = calculateTravelBudget({});
    expect(result.totalTripCost).toBeGreaterThan(0);
    expect(result.days).toBeGreaterThanOrEqual(2);
    expect(result.costPerPerson).toBeGreaterThan(0);
  });

  // ─── Test 27: Non-numeric inputs handled gracefully ───
  it('handles non-numeric inputs gracefully', () => {
    const result = calculateTravelBudget({
      travelers: 'abc',
      nights: undefined,
      flightCost: null,
    });
    // Should use defaults and not throw
    expect(result.totalTripCost).toBeGreaterThan(0);
    expect(result.days).toBeGreaterThanOrEqual(2);
  });
});
