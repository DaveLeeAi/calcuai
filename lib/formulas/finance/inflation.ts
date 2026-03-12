/**
 * Inflation Calculator Formula
 *
 * Future Cost (what will today's price cost in the future):
 *   FV = PV × (1 + r)^n
 *
 * Buying Power (what will today's dollars be worth in the future):
 *   PV = FV / (1 + r)^n
 *   Alternatively: Buying Power = Amount / (1 + r)^n
 *
 * Where:
 *   PV = present value (today's dollars)
 *   FV = future value
 *   r = annual inflation rate (as decimal)
 *   n = number of years
 *
 * Source: Bureau of Labor Statistics (BLS) — Consumer Price Index (CPI)
 * Historical U.S. average inflation: ~3.2% annually (1913–2024)
 */
export function calculateInflation(inputs: Record<string, unknown>): Record<string, unknown> {
  const amount = Number(inputs.amount) || 0;
  const inflationRate = (Number(inputs.inflationRate) || 0) / 100;
  const years = Number(inputs.years) || 0;
  const calculationMode = String(inputs.calculationMode || 'buying-power');

  if (amount <= 0 || years <= 0) {
    return {
      resultAmount: 0,
      totalChange: 0,
      percentageChange: 0,
      summary: [],
      inflationOverTime: [],
    };
  }

  let resultAmount: number;
  let totalChange: number;
  let percentageChange: number;
  const inflationOverTime: { year: number; value: number }[] = [];

  if (calculationMode === 'future-cost') {
    // What will today's $X cost in n years?
    resultAmount = amount * Math.pow(1 + inflationRate, years);
    totalChange = resultAmount - amount;
    percentageChange = ((resultAmount - amount) / amount) * 100;

    // Build year-by-year data
    for (let y = 0; y <= years; y++) {
      const val = amount * Math.pow(1 + inflationRate, y);
      inflationOverTime.push({ year: y, value: parseFloat(val.toFixed(2)) });
    }
  } else {
    // buying-power mode (default): What will $X be worth in n years?
    resultAmount = amount / Math.pow(1 + inflationRate, years);
    totalChange = resultAmount - amount; // negative (loss)
    percentageChange = ((resultAmount - amount) / amount) * 100; // negative

    // Build year-by-year data showing purchasing power decline
    for (let y = 0; y <= years; y++) {
      const val = amount / Math.pow(1 + inflationRate, y);
      inflationOverTime.push({ year: y, value: parseFloat(val.toFixed(2)) });
    }
  }

  resultAmount = parseFloat(resultAmount.toFixed(2));
  totalChange = parseFloat(totalChange.toFixed(2));
  percentageChange = parseFloat(percentageChange.toFixed(2));

  const modeLabel = calculationMode === 'future-cost' ? 'Future Cost' : 'Future Buying Power';
  const inflationRatePercent = parseFloat((inflationRate * 100).toFixed(2));

  const summary: { label: string; value: number | string }[] = [
    { label: 'Starting Amount', value: parseFloat(amount.toFixed(2)) },
    { label: modeLabel, value: resultAmount },
    { label: 'Change', value: totalChange },
    { label: 'Percentage Change', value: `${percentageChange}%` },
    { label: 'Inflation Rate', value: `${inflationRatePercent}%` },
    { label: 'Time Period', value: `${years} year${years !== 1 ? 's' : ''}` },
  ];

  return {
    resultAmount,
    totalChange,
    percentageChange,
    summary,
    inflationOverTime,
  };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'inflation': calculateInflation,
};
