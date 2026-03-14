/**
 * Property Appreciation Calculator
 *
 * Formulas:
 *   Future Value = Present Value × (1 + Annual Rate)^Years
 *   Total Appreciation = Future Value − Present Value
 *   Total Appreciation % = (Total Appreciation / Present Value) × 100
 *   Equity = Future Value − Remaining Mortgage Balance
 *
 * Source: Federal Housing Finance Agency (FHFA) — House Price Index (2025).
 * Source: S&P CoreLogic Case-Shiller Home Price Index (2025).
 */

export interface PropertyAppreciationInput {
  currentValue: number;
  annualAppreciationRate: number;
  years: number;
  remainingMortgage: number;
}

export interface AppreciationYearRow {
  year: number;
  propertyValue: number;
  appreciation: number;
  equity: number;
}

export interface PropertyAppreciationOutput {
  futureValue: number;
  totalAppreciation: number;
  totalAppreciationPercent: number;
  projectedEquity: number;
  yearByYearTable: AppreciationYearRow[];
  summary: { label: string; value: number }[];
}

/**
 * Projects property value growth over time using compound appreciation.
 *
 * Future Value = Present Value × (1 + r)^n
 * Equity = Future Value − Remaining Mortgage
 *
 * @param inputs - Record with currentValue, annualAppreciationRate, years, remainingMortgage
 * @returns Record with futureValue, totalAppreciation, totalAppreciationPercent, projectedEquity, yearByYearTable, summary
 */
export function calculatePropertyAppreciation(inputs: Record<string, unknown>): Record<string, unknown> {
  const currentValue = Math.max(1, Number(inputs.currentValue) || 0);
  const annualAppreciationRate = inputs.annualAppreciationRate !== undefined
    ? Math.min(30, Math.max(-20, Number(inputs.annualAppreciationRate)))
    : 3;
  const years = Math.min(50, Math.max(1, Math.round(Number(inputs.years) || 10)));
  const remainingMortgage = Math.max(0, Number(inputs.remainingMortgage) || 0);

  const rateDecimal = annualAppreciationRate / 100;
  const futureValue = parseFloat((currentValue * Math.pow(1 + rateDecimal, years)).toFixed(2));
  const totalAppreciation = parseFloat((futureValue - currentValue).toFixed(2));
  const totalAppreciationPercent = parseFloat(((totalAppreciation / currentValue) * 100).toFixed(2));
  const projectedEquity = parseFloat(Math.max(0, futureValue - remainingMortgage).toFixed(2));

  const yearByYearTable: AppreciationYearRow[] = [];
  for (let y = 1; y <= Math.min(years, 30); y++) {
    const value = parseFloat((currentValue * Math.pow(1 + rateDecimal, y)).toFixed(2));
    const appreciation = parseFloat((value - currentValue).toFixed(2));
    const equity = parseFloat(Math.max(0, value - remainingMortgage).toFixed(2));
    yearByYearTable.push({ year: y, propertyValue: value, appreciation, equity });
  }

  const summary: { label: string; value: number }[] = [
    { label: 'Current Value', value: currentValue },
    { label: 'Future Value', value: futureValue },
    { label: 'Total Appreciation ($)', value: totalAppreciation },
    { label: 'Total Appreciation (%)', value: totalAppreciationPercent },
    { label: 'Projected Equity', value: projectedEquity },
    { label: 'Annual Rate (%)', value: annualAppreciationRate },
  ];

  return { futureValue, totalAppreciation, totalAppreciationPercent, projectedEquity, yearByYearTable, summary };
}

/** @formulaRegistry */
export const FORMULA_REGISTRY: Record<string, (inputs: Record<string, unknown>) => Record<string, unknown>> = {
  'property-appreciation': calculatePropertyAppreciation,
};
