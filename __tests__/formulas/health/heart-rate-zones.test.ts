import { calculateHeartRateZones } from '@/lib/formulas/health/heart-rate-zones';

describe('calculateHeartRateZones', () => {
  // Standard case: 30-year-old, RHR 70
  it('calculates MHR and HRR for 30-year-old with RHR 70', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    // MHR = 220 - 30 = 190
    expect(result.maxHeartRate).toBe(190);
    // HRR = 190 - 70 = 120
    expect(result.heartRateReserve).toBe(120);
  });

  it('calculates Zone 1 correctly for 30-year-old with RHR 70', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    // Zone 1: 50-60% HRR + RHR
    // Min: 120 * 0.50 + 70 = 130
    // Max: 120 * 0.60 + 70 = 142
    expect(result.zones[0].bpmMin).toBe(130);
    expect(result.zones[0].bpmMax).toBe(142);
    expect(result.zones[0].name).toBe('Very Light');
  });

  it('calculates Zone 2 correctly for 30-year-old with RHR 70', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    // Zone 2: 60-70% HRR + RHR
    // Min: 120 * 0.60 + 70 = 142
    // Max: 120 * 0.70 + 70 = 154
    expect(result.zones[1].bpmMin).toBe(142);
    expect(result.zones[1].bpmMax).toBe(154);
    expect(result.zones[1].name).toBe('Light');
  });

  it('calculates Zone 3 correctly for 30-year-old with RHR 70', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    // Zone 3: 70-80% HRR + RHR
    // Min: 120 * 0.70 + 70 = 154
    // Max: 120 * 0.80 + 70 = 166
    expect(result.zones[2].bpmMin).toBe(154);
    expect(result.zones[2].bpmMax).toBe(166);
    expect(result.zones[2].name).toBe('Moderate');
  });

  it('calculates Zone 4 correctly for 30-year-old with RHR 70', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    // Zone 4: 80-90% HRR + RHR
    // Min: 120 * 0.80 + 70 = 166
    // Max: 120 * 0.90 + 70 = 178
    expect(result.zones[3].bpmMin).toBe(166);
    expect(result.zones[3].bpmMax).toBe(178);
    expect(result.zones[3].name).toBe('Hard');
  });

  it('calculates Zone 5 correctly for 30-year-old with RHR 70', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    // Zone 5: 90-100% HRR + RHR
    // Min: 120 * 0.90 + 70 = 178
    // Max: 120 * 1.00 + 70 = 190
    expect(result.zones[4].bpmMin).toBe(178);
    expect(result.zones[4].bpmMax).toBe(190);
    expect(result.zones[4].name).toBe('Maximum');
  });

  // 50-year-old, RHR 65
  it('calculates zones for 50-year-old with RHR 65', () => {
    const result = calculateHeartRateZones({
      age: 50,
      restingHeartRate: 65,
      maxHeartRateMethod: 'formula',
    });
    // MHR = 220 - 50 = 170, HRR = 170 - 65 = 105
    expect(result.maxHeartRate).toBe(170);
    expect(result.heartRateReserve).toBe(105);
    // Zone 1: 105 * 0.50 + 65 = 118 (rounded from 117.5)
    expect(result.zones[0].bpmMin).toBeCloseTo(118, 0);
    // Zone 3 max: 105 * 0.80 + 65 = 149
    expect(result.zones[2].bpmMax).toBe(149);
  });

  // 20-year-old athlete, RHR 50
  it('calculates zones for 20-year-old athlete with RHR 50', () => {
    const result = calculateHeartRateZones({
      age: 20,
      restingHeartRate: 50,
      maxHeartRateMethod: 'formula',
    });
    // MHR = 220 - 20 = 200, HRR = 200 - 50 = 150
    expect(result.maxHeartRate).toBe(200);
    expect(result.heartRateReserve).toBe(150);
    // Zone 1: 150 * 0.50 + 50 = 125
    expect(result.zones[0].bpmMin).toBe(125);
    // Zone 5 max: 150 * 1.00 + 50 = 200
    expect(result.zones[4].bpmMax).toBe(200);
  });

  // Known max HR
  it('uses known max heart rate when provided', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'known',
      knownMaxHeartRate: 195,
    });
    // MHR = 195 (not 190), HRR = 195 - 70 = 125
    expect(result.maxHeartRate).toBe(195);
    expect(result.heartRateReserve).toBe(125);
    // Zone 5 max: 125 * 1.00 + 70 = 195
    expect(result.zones[4].bpmMax).toBe(195);
  });

  // Edge: very high RHR
  it('handles very high resting heart rate (100)', () => {
    const result = calculateHeartRateZones({
      age: 40,
      restingHeartRate: 100,
      maxHeartRateMethod: 'formula',
    });
    // MHR = 180, HRR = 180 - 100 = 80
    expect(result.maxHeartRate).toBe(180);
    expect(result.heartRateReserve).toBe(80);
    // Zone 1 min: 80 * 0.50 + 100 = 140
    expect(result.zones[0].bpmMin).toBe(140);
    // Zone 5 max: 80 * 1.00 + 100 = 180
    expect(result.zones[4].bpmMax).toBe(180);
  });

  // Edge: very old person
  it('handles elderly person (80 years old, RHR 75)', () => {
    const result = calculateHeartRateZones({
      age: 80,
      restingHeartRate: 75,
      maxHeartRateMethod: 'formula',
    });
    // MHR = 220 - 80 = 140, HRR = 140 - 75 = 65
    expect(result.maxHeartRate).toBe(140);
    expect(result.heartRateReserve).toBe(65);
    // Zone 1 min: 65 * 0.50 + 75 = 108 (rounded from 107.5)
    expect(result.zones[0].bpmMin).toBeCloseTo(108, 0);
  });

  // Verify all 5 zones present
  it('returns exactly 5 zones', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    expect(result.zones).toHaveLength(5);
    expect(result.zones[0].zone).toBe(1);
    expect(result.zones[4].zone).toBe(5);
  });

  // Verify zones are contiguous
  it('has contiguous zones (zone N max = zone N+1 min)', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    for (let i = 0; i < result.zones.length - 1; i++) {
      expect(result.zones[i].bpmMax).toBe(result.zones[i + 1].bpmMin);
    }
  });

  // Average zone BPM
  it('calculates average zone BPM midpoints', () => {
    const result = calculateHeartRateZones({
      age: 30,
      restingHeartRate: 70,
      maxHeartRateMethod: 'formula',
    });
    expect(result.averageZoneBpm).toHaveLength(5);
    // Zone 1 midpoint: (130 + 142) / 2 = 136
    expect(result.averageZoneBpm[0]).toBe(136);
    // Zone 3 midpoint: (154 + 166) / 2 = 160
    expect(result.averageZoneBpm[2]).toBe(160);
  });

  // Verify Zone 5 max equals MHR
  it('has Zone 5 max equal to max heart rate', () => {
    const result = calculateHeartRateZones({
      age: 35,
      restingHeartRate: 60,
      maxHeartRateMethod: 'formula',
    });
    expect(result.zones[4].bpmMax).toBe(result.maxHeartRate);
  });
});
