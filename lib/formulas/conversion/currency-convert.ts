/**
 * Currency Converter — exchange rate conversion with fee calculation
 *
 * Core formula:
 *   convertedAmount = amount × exchangeRate
 *   feeAmount = convertedAmount × (bankFeePercent / 100)
 *   amountAfterFees = convertedAmount − feeAmount
 *   inverseRate = 1 / exchangeRate
 *
 * Conversion table shows common amounts [1, 5, 10, 50, 100, 500, 1000]
 * multiplied by the exchange rate for quick reference.
 *
 * Source: International Monetary Fund (IMF) — SDR Valuation;
 * European Central Bank (ECB) — Reference Exchange Rates;
 * Federal Reserve — Foreign Exchange Rates.
 */

const COMMON_AMOUNTS = [1, 5, 10, 50, 100, 500, 1000];

/**
 * Converts an amount from one currency to another using a user-provided
 * exchange rate, optionally applying a bank/service fee.
 *
 * convertedAmount = amount × exchangeRate
 * amountAfterFees = convertedAmount × (1 − fee%)
 *
 * @param inputs - Record with amount, fromCurrency, toCurrency, exchangeRate, bankFeePercent
 * @returns Record with convertedAmount, exchangeRateDisplay, inverseRate, feeAmount,
 *          amountAfterFees, conversionTable
 */
export function calculateCurrencyConvert(inputs: Record<string, unknown>): Record<string, unknown> {
  // 1. Parse inputs
  const amount = Math.max(0, Number(inputs.amount) || 0);
  const fromCurrency = String(inputs.fromCurrency || 'USD');
  const toCurrency = String(inputs.toCurrency || 'EUR');
  const bankFeePercent = Math.max(0, Math.min(100, Number(inputs.bankFeePercent) || 0));

  // Handle exchange rate — same currency defaults to 1
  let exchangeRate = Number(inputs.exchangeRate);
  if (isNaN(exchangeRate) || exchangeRate <= 0) {
    exchangeRate = fromCurrency === toCurrency ? 1 : 0;
  }
  if (fromCurrency === toCurrency) {
    exchangeRate = 1;
  }

  // 2. Guard: zero exchange rate
  if (exchangeRate === 0) {
    return {
      convertedAmount: 0,
      exchangeRateDisplay: `1 ${fromCurrency} = 0 ${toCurrency}`,
      inverseRate: 'N/A',
      feeAmount: 0,
      amountAfterFees: 0,
      conversionTable: COMMON_AMOUNTS.map((a) => ({
        label: `${a} ${fromCurrency}`,
        value: `0.00 ${toCurrency}`,
      })),
    };
  }

  // 3. Core calculations
  const convertedAmount = parseFloat((amount * exchangeRate).toFixed(2));
  const inverseRateValue = parseFloat((1 / exchangeRate).toFixed(6));
  const feeAmount = parseFloat((convertedAmount * (bankFeePercent / 100)).toFixed(2));
  const amountAfterFees = parseFloat((convertedAmount - feeAmount).toFixed(2));

  // 4. Display strings
  const exchangeRateDisplay = `1 ${fromCurrency} = ${exchangeRate} ${toCurrency}`;
  const inverseRate = `1 ${toCurrency} = ${inverseRateValue} ${fromCurrency}`;

  // 5. Quick reference conversion table
  const conversionTable = COMMON_AMOUNTS.map((a) => ({
    label: `${a} ${fromCurrency}`,
    value: `${parseFloat((a * exchangeRate).toFixed(2))} ${toCurrency}`,
  }));

  return {
    convertedAmount,
    exchangeRateDisplay,
    inverseRate,
    feeAmount,
    amountAfterFees,
    conversionTable,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'currency-convert': calculateCurrencyConvert,
};
