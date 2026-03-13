import { calculateCurrencyConvert } from '@/lib/formulas/conversion/currency-convert';

describe('calculateCurrencyConvert', () => {
  // ─── Test 1: USD to EUR at 0.92 rate ───
  it('converts $1,000 to EUR at 0.92 rate', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(920);
  });

  // ─── Test 2: EUR to USD (inverse direction) ───
  it('converts EUR to USD at 1.087 rate', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'EUR',
      toCurrency: 'USD',
      exchangeRate: 1.087,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(1087);
  });

  // ─── Test 3: Same currency (rate = 1) ───
  it('returns same amount for same currency conversion', () => {
    const result = calculateCurrencyConvert({
      amount: 500,
      fromCurrency: 'USD',
      toCurrency: 'USD',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    // Same currency forces rate to 1
    expect(result.convertedAmount).toBe(500);
  });

  // ─── Test 4: JPY conversion (large numbers) ───
  it('handles JPY conversion with large numbers', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'JPY',
      exchangeRate: 149.5,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(149500);
  });

  // ─── Test 5: Zero amount ───
  it('returns zero for zero amount', () => {
    const result = calculateCurrencyConvert({
      amount: 0,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(0);
    expect(result.feeAmount).toBe(0);
    expect(result.amountAfterFees).toBe(0);
  });

  // ─── Test 6: Large amount ($1,000,000) ───
  it('handles large amounts correctly', () => {
    const result = calculateCurrencyConvert({
      amount: 1000000,
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      exchangeRate: 0.79,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(790000);
  });

  // ─── Test 7: Very small rate (e.g., USD to KRW) ───
  it('handles very small inverse rates (USD to KRW)', () => {
    const result = calculateCurrencyConvert({
      amount: 100,
      fromCurrency: 'USD',
      toCurrency: 'KRW',
      exchangeRate: 1325.5,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(132550);
  });

  // ─── Test 8: Very large rate (from JPY to GBP) ───
  it('handles very small exchange rates (JPY to GBP)', () => {
    const result = calculateCurrencyConvert({
      amount: 10000,
      fromCurrency: 'JPY',
      toCurrency: 'GBP',
      exchangeRate: 0.0053,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(53);
  });

  // ─── Test 9: With 3% bank fee ───
  it('calculates 3% bank fee correctly', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 3,
    });
    expect(result.convertedAmount).toBe(920);
    expect(result.feeAmount).toBe(27.6);
    expect(result.amountAfterFees).toBe(892.4);
  });

  // ─── Test 10: With 0% fee ───
  it('returns zero fee when bankFeePercent is 0', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(result.feeAmount).toBe(0);
    expect(result.amountAfterFees).toBe(920);
  });

  // ─── Test 11: Fee amount = converted * fee% ───
  it('fee amount equals converted amount times fee percentage', () => {
    const result = calculateCurrencyConvert({
      amount: 500,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 2,
    });
    // converted = 460, fee = 460 * 0.02 = 9.20
    expect(result.feeAmount).toBe(9.2);
  });

  // ─── Test 12: Amount after fees = converted - fee ───
  it('amount after fees equals converted minus fee', () => {
    const result = calculateCurrencyConvert({
      amount: 500,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 2,
    });
    const converted = result.convertedAmount as number;
    const fee = result.feeAmount as number;
    expect(result.amountAfterFees).toBe(parseFloat((converted - fee).toFixed(2)));
  });

  // ─── Test 13: Inverse rate = 1/rate ───
  it('calculates inverse rate correctly', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    const inverseStr = result.inverseRate as string;
    // 1/0.92 = 1.086957...
    expect(inverseStr).toContain('1.08');
    expect(inverseStr).toContain('EUR');
    expect(inverseStr).toContain('USD');
  });

  // ─── Test 14: Conversion table has 7 entries ───
  it('conversion table contains 7 common amount entries', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    const table = result.conversionTable as Array<{ label: string; value: string }>;
    expect(table).toHaveLength(7);
  });

  // ─── Test 15: Output has all expected keys ───
  it('returns all expected output keys', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(result).toHaveProperty('convertedAmount');
    expect(result).toHaveProperty('exchangeRateDisplay');
    expect(result).toHaveProperty('inverseRate');
    expect(result).toHaveProperty('feeAmount');
    expect(result).toHaveProperty('amountAfterFees');
    expect(result).toHaveProperty('conversionTable');
  });

  // ─── Test 16: Small amount (0.01) ───
  it('handles very small amounts', () => {
    const result = calculateCurrencyConvert({
      amount: 0.01,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(0.01);
  });

  // ─── Test 17: 5% bank fee ───
  it('calculates 5% bank fee correctly', () => {
    const result = calculateCurrencyConvert({
      amount: 2000,
      fromCurrency: 'USD',
      toCurrency: 'GBP',
      exchangeRate: 0.79,
      bankFeePercent: 5,
    });
    // converted = 1580, fee = 79, after = 1501
    expect(result.convertedAmount).toBe(1580);
    expect(result.feeAmount).toBe(79);
    expect(result.amountAfterFees).toBe(1501);
  });

  // ─── Test 18: exchangeRateDisplay is a string ───
  it('exchangeRateDisplay is a formatted string', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(typeof result.exchangeRateDisplay).toBe('string');
    expect(result.exchangeRateDisplay).toBe('1 USD = 0.92 EUR');
  });

  // ─── Test 19: inverseRate is a string ───
  it('inverseRate is a formatted string', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(typeof result.inverseRate).toBe('string');
    expect(result.inverseRate).toContain('1 EUR');
  });

  // ─── Test 20: conversionTable is an array ───
  it('conversionTable is an array with correct structure', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    const table = result.conversionTable as Array<{ label: string; value: string }>;
    expect(Array.isArray(table)).toBe(true);
    expect(table[0]).toHaveProperty('label');
    expect(table[0]).toHaveProperty('value');
    // First entry: 1 USD = 0.92 EUR
    expect(table[0].label).toBe('1 USD');
    expect(table[0].value).toBe('0.92 EUR');
  });

  // ─── Test 21: Zero exchange rate returns zeros ───
  it('handles zero exchange rate gracefully', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(0);
    expect(result.inverseRate).toBe('N/A');
  });

  // ─── Test 22: Negative amount treated as zero ───
  it('treats negative amount as zero', () => {
    const result = calculateCurrencyConvert({
      amount: -500,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    expect(result.convertedAmount).toBe(0);
  });

  // ─── Test 23: Conversion table entries are correct ───
  it('conversion table shows correct values for common amounts', () => {
    const result = calculateCurrencyConvert({
      amount: 1000,
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      exchangeRate: 0.92,
      bankFeePercent: 0,
    });
    const table = result.conversionTable as Array<{ label: string; value: string }>;
    // 10 USD = 9.2 EUR
    expect(table[2].label).toBe('10 USD');
    expect(table[2].value).toBe('9.2 EUR');
    // 1000 USD = 920 EUR
    expect(table[6].label).toBe('1000 USD');
    expect(table[6].value).toBe('920 EUR');
  });
});
