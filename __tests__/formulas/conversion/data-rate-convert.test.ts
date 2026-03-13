import { calculateDataRateConvert } from '@/lib/formulas/conversion/data-rate-convert';

describe('calculateDataRateConvert', () => {
  // ─── Test 1: Same unit returns same value ───
  it('returns same value for same-unit conversion', () => {
    const result = calculateDataRateConvert({ value: 100, fromUnit: 'mbps', toUnit: 'mbps' });
    expect(result.convertedValue).toBe(100);
  });

  // ─── Test 2: 1 Mbps = 1,000 kbps ───
  it('converts 1 Mbps to 1000 kbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'mbps', toUnit: 'kbps' });
    expect(result.convertedValue).toBe(1000);
  });

  // ─── Test 3: 1 Gbps = 1,000 Mbps ───
  it('converts 1 Gbps to 1000 Mbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'gbps', toUnit: 'mbps' });
    expect(result.convertedValue).toBe(1000);
  });

  // ─── Test 4: 1 Tbps = 1,000 Gbps ───
  it('converts 1 Tbps to 1000 Gbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'tbps', toUnit: 'gbps' });
    expect(result.convertedValue).toBe(1000);
  });

  // ─── Test 5: 8 bps = 1 byte/s (bits to bytes) ───
  it('converts 8 bps to 1 byte/s', () => {
    const result = calculateDataRateConvert({ value: 8, fromUnit: 'bps', toUnit: 'bytes-per-sec' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 6: 1 MB/s = 8 Mbps ───
  it('converts 1 MB/s to 8 Mbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'mb-per-sec', toUnit: 'mbps' });
    expect(result.convertedValue).toBe(8);
  });

  // ─── Test 7: 100 Mbps to MB/s (common ISP speed) ───
  it('converts 100 Mbps to 12.5 MB/s', () => {
    const result = calculateDataRateConvert({ value: 100, fromUnit: 'mbps', toUnit: 'mb-per-sec' });
    expect(result.convertedValue).toBe(12.5);
  });

  // ─── Test 8: 1 Gbps to MB/s ───
  it('converts 1 Gbps to 125 MB/s', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'gbps', toUnit: 'mb-per-sec' });
    expect(result.convertedValue).toBe(125);
  });

  // ─── Test 9: 1 GB/s = 8 Gbps ───
  it('converts 1 GB/s to 8 Gbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'gb-per-sec', toUnit: 'gbps' });
    expect(result.convertedValue).toBe(8);
  });

  // ─── Test 10: 1 KB/s = 8 kbps ───
  it('converts 1 KB/s to 8 kbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'kb-per-sec', toUnit: 'kbps' });
    expect(result.convertedValue).toBe(8);
  });

  // ─── Test 11: 500 Mbps to GB/s ───
  it('converts 500 Mbps to 0.0625 GB/s', () => {
    const result = calculateDataRateConvert({ value: 500, fromUnit: 'mbps', toUnit: 'gb-per-sec' });
    expect(result.convertedValue).toBe(0.0625);
  });

  // ─── Test 12: 1000 kbps = 1 Mbps ───
  it('converts 1000 kbps to 1 Mbps', () => {
    const result = calculateDataRateConvert({ value: 1000, fromUnit: 'kbps', toUnit: 'mbps' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 13: Zero value ───
  it('returns zero for zero value', () => {
    const result = calculateDataRateConvert({ value: 0, fromUnit: 'mbps', toUnit: 'kbps' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 14: Negative value treated as zero ───
  it('treats negative value as zero', () => {
    const result = calculateDataRateConvert({ value: -100, fromUnit: 'mbps', toUnit: 'kbps' });
    expect(result.convertedValue).toBe(0);
  });

  // ─── Test 15: Large value — 10 Tbps ───
  it('handles large values: 10 Tbps to Gbps', () => {
    const result = calculateDataRateConvert({ value: 10, fromUnit: 'tbps', toUnit: 'gbps' });
    expect(result.convertedValue).toBe(10000);
  });

  // ─── Test 16: Small value — 1 bps to kbps ───
  it('handles small values: 1 bps to kbps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'bps', toUnit: 'kbps' });
    expect(result.convertedValue).toBe(0.001);
  });

  // ─── Test 17: Round-trip A→B→A ───
  it('round-trip conversion returns original value', () => {
    const forward = calculateDataRateConvert({ value: 100, fromUnit: 'mbps', toUnit: 'kb-per-sec' });
    const back = calculateDataRateConvert({ value: forward.convertedValue, fromUnit: 'kb-per-sec', toUnit: 'mbps' });
    expect(back.convertedValue).toBeCloseTo(100, 3);
  });

  // ─── Test 18: Conversion rate Mbps to MB/s ───
  it('conversionRate for Mbps to MB/s is 0.125', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'mbps', toUnit: 'mb-per-sec' });
    expect(result.conversionRate).toBe(0.125);
  });

  // ─── Test 19: Inverse rate Mbps to MB/s ───
  it('inverseRate for Mbps to MB/s is 8', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'mbps', toUnit: 'mb-per-sec' });
    expect(result.inverseRate).toBe(8);
  });

  // ─── Test 20: conversionDisplay formatted correctly ───
  it('conversionDisplay is formatted correctly', () => {
    const result = calculateDataRateConvert({ value: 100, fromUnit: 'mbps', toUnit: 'mb-per-sec' });
    expect(result.conversionDisplay).toBe('100 mbps = 12.5 mb-per-sec');
  });

  // ─── Test 21: conversionTable has 9 entries ───
  it('conversionTable contains 9 entries (one per unit)', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'mbps', toUnit: 'kbps' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table).toHaveLength(9);
  });

  // ─── Test 22: conversionTable structure ───
  it('conversionTable entries have correct structure', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'mbps', toUnit: 'kbps' });
    const table = result.conversionTable as Array<{ label: string; value: number }>;
    expect(table[0]).toHaveProperty('label');
    expect(table[0]).toHaveProperty('value');
    expect(table[0].label).toBe('Bps');
    expect(table[0].value).toBe(1000000);
  });

  // ─── Test 23: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateDataRateConvert({ value: 100, fromUnit: 'mbps', toUnit: 'mb-per-sec' });
    expect(result).toHaveProperty('convertedValue');
    expect(result).toHaveProperty('fromUnit');
    expect(result).toHaveProperty('toUnit');
    expect(result).toHaveProperty('conversionRate');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('conversionDisplay');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 24: Defaults to mbps → mb-per-sec when units omitted ───
  it('defaults to mbps → mb-per-sec when units omitted', () => {
    const result = calculateDataRateConvert({ value: 100 });
    expect(result.fromUnit).toBe('mbps');
    expect(result.toUnit).toBe('mb-per-sec');
    expect(result.convertedValue).toBe(12.5);
  });

  // ─── Test 25: String input coercion ───
  it('handles string input values correctly', () => {
    const result = calculateDataRateConvert({ value: '1000', fromUnit: 'kbps', toUnit: 'mbps' });
    expect(result.convertedValue).toBe(1);
  });

  // ─── Test 26: 300 Mbps ISP speed to practical download ───
  it('converts 300 Mbps to 37.5 MB/s (real-world ISP speed)', () => {
    const result = calculateDataRateConvert({ value: 300, fromUnit: 'mbps', toUnit: 'mb-per-sec' });
    expect(result.convertedValue).toBe(37.5);
  });

  // ─── Test 27: bytes-per-sec to bps ───
  it('converts 1 byte/s to 8 bps', () => {
    const result = calculateDataRateConvert({ value: 1, fromUnit: 'bytes-per-sec', toUnit: 'bps' });
    expect(result.convertedValue).toBe(8);
  });
});
